update users set password_hash = '$2a$10$4jKj8f1jOhx6iaDWh2sAQOhXp3I6rqk1EJZCFdgyFAVuihH9cX4c.'
where email in ('owner@veetu.test','tenant@veetu.test','admin@veetu.test');
