-- Module 4: allow owners to insert conversations/messages via dashboard API (RLS)
create policy "Users can insert own conversations"
  on conversations for insert
  with check (
    business_id in (
      select id from businesses where owner_user_id = auth.uid()
    )
  );

create policy "Users can insert own messages"
  on messages for insert
  with check (
    conversation_id in (
      select c.id from conversations c
      join businesses b on b.id = c.business_id
      where b.owner_user_id = auth.uid()
    )
  );
