interface Env {
  R2: R2Bucket;
  NUKE_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      return await this.handleRequest(request, env, ctx);
    } catch(e) {
      return new Response(e.stack, { status: 500 });
    }
  },

  async handleRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const { pathname } = new URL(request.url);
    // remove /api
    const path = pathname.slice(4);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }});
    }

    // Grab all the images from my R2 bucket
    if (path === '/images') {
      const images = await this.grabAllImages(env.R2);

      return new Response(JSON.stringify(images), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // Grab a specific image
    if (path.startsWith('/image/')) {
      // Get the UUID from the URL (/image/{uuid})
      const uuid = path.slice(7);

      // Check the Cache API to see if we already have the image and if so return it.
      const cache = caches.default;
      const cachedResponse = await cache.match(request.url.toString());
      if (cachedResponse) {
        return cachedResponse;
      }

      // Image isn't in the Cache API so grab it from R2!
      const image = await env.R2.get(uuid);

      // If there's nothing in R2 with that UUID then return a 404
      if (image === null) {
        return new Response('Image not found :(', { status: 404 });
      }

      // Return the image!
      const resp = new Response(await image.arrayBuffer(), {
        headers: {
          'Content-Type': image.httpMetadata.contentType ?? 'image/png',
          'Cache-Control': 'public, s-maxage=3600',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });

      ctx.waitUntil(cache.put(request.url.toString(), resp.clone()));

      return resp;
    }

    // Uploaddddddd
    if (path === '/upload' && request.method === 'POST' && request.headers.get('authorization') === 'uk-london-meetup-2022-04-walshy-demo') {
      // Generate a random UUID
      const uuid = crypto.randomUUID();

      const contentType = request.headers.get('content-type');

      // Make sure we have a content-type
      if (contentType === null) {
        return new Response('Content-Type is required!', { status: 400 });
      }

      // Insert the image into R2 under the UUID
      await env.R2.put(uuid, request.body, {
        httpMetadata: {
          contentType: contentType
        }
      });

      return new Response('Uploaded!');
    }

    if (path === '/nuke' && request.method === 'DELETE' && request.headers.get('authorization') === env.NUKE_SECRET) {
      const images = await this.grabAllImages(env.R2);

      for (const image of images) {
        await env.R2.delete(image);
      }

      return new Response('Nuked!');
    }

    if (path === '/debug') {
      const items = await env.R2.list({ cursor: undefined, include: [], limit: 1000 });

      return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response('Hello lost traveller!', { status: 404 });
  },

  // Grab all the image UUIDs
  async grabAllImages(bucket: R2Bucket): Promise<string[]> {
    const list: string[] = [];

    let end = false;
    let cursor: string | undefined = undefined;

    while (!end) {
      const items: R2Objects = await bucket.list({ cursor, include: [], limit: 1000 });

      if (!items.truncated) {
        end = true;
      } else {
        cursor = items.cursor;
      }

      for (const obj of items.objects) {
        list.push(obj.key);
      }
    }

    return list;
  }
};
