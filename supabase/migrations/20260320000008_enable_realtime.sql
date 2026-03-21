-- Enable Supabase Realtime for the tables used by the mobile app.
-- Without this, postgres_changes subscriptions receive no events.
ALTER PUBLICATION supabase_realtime ADD TABLE entries;
ALTER PUBLICATION supabase_realtime ADD TABLE groups;
ALTER PUBLICATION supabase_realtime ADD TABLE group_members;
