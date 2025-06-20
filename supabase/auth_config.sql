-- Configure authentication settings
update auth.users
set 
    email_confirmed_at = now(),
    updated_at = now(); 