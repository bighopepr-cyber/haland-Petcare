import { createClient } from "@supabase/supabase-js";

let supabase: ReturnType<typeof createClient> | null = null;

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required"
    );
  }

  if (!supabase) {
    supabase = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return supabase;
}

export async function uploadFile(
  bucket: string,
  path: string,
  buffer: Buffer,
  mimetype: string
): Promise<string> {
  const client = getClient();
  const { error } = await client.storage.from(bucket).upload(path, buffer, {
    contentType: mimetype,
    upsert: true,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: publicUrl } = client.storage.from(bucket).getPublicUrl(path);
  return publicUrl.publicUrl;
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const client = getClient();
  const { error } = await client.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}