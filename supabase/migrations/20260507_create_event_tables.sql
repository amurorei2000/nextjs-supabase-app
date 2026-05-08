-- events 테이블
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  max_participants INTEGER,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  public_token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- participants 테이블
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  memo TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (event_id, phone)
);

-- carpool_drivers 테이블 (ADR-01: participant_id FK 없음, name+phone 직접 저장)
CREATE TABLE carpool_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  departure TEXT NOT NULL,
  available_seats INTEGER NOT NULL,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- carpool_passengers 테이블
CREATE TABLE carpool_passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES carpool_drivers(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- expenses 테이블
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  paid_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE carpool_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE carpool_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- events RLS 정책
CREATE POLICY "events_select_all" ON events FOR SELECT USING (true);
CREATE POLICY "events_insert_auth" ON events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "events_update_organizer" ON events FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "events_delete_organizer" ON events FOR DELETE USING (auth.uid() = organizer_id);

-- participants RLS 정책
CREATE POLICY "participants_select_all" ON participants FOR SELECT USING (true);
CREATE POLICY "participants_insert_all" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "participants_update_organizer" ON participants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = participants.event_id
        AND events.organizer_id = auth.uid()
    )
  );

-- carpool_drivers RLS 정책
CREATE POLICY "carpool_drivers_select_all" ON carpool_drivers FOR SELECT USING (true);
CREATE POLICY "carpool_drivers_insert_all" ON carpool_drivers FOR INSERT WITH CHECK (true);

-- carpool_passengers RLS 정책
CREATE POLICY "carpool_passengers_select_all" ON carpool_passengers FOR SELECT USING (true);
CREATE POLICY "carpool_passengers_insert_all" ON carpool_passengers FOR INSERT WITH CHECK (true);

-- expenses RLS 정책
CREATE POLICY "expenses_select_all" ON expenses FOR SELECT USING (true);
CREATE POLICY "expenses_insert_organizer" ON expenses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = expenses.event_id
        AND events.organizer_id = auth.uid()
    )
  );
CREATE POLICY "expenses_delete_organizer" ON expenses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = expenses.event_id
        AND events.organizer_id = auth.uid()
    )
  );
