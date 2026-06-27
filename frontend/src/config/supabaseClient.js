import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase 환경변수가 설정되지 않았습니다. " +
    "REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY를 .env.local에 추가하세요."
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
