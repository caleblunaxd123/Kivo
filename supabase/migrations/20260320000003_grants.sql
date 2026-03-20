-- Ensure authenticated users can manage their own profile
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.groups TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.group_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entry_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entry_splits TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attachments TO authenticated;
GRANT SELECT ON public.settlements TO authenticated;
GRANT SELECT ON public.daily_closures TO authenticated;
