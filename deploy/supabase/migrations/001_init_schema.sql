-- ============================================================
-- Passit — PostgreSQL Schema (Supabase)
-- MySQL → PostgreSQL 변환 규칙:
--   AUTO_INCREMENT       → BIGSERIAL
--   DATETIME / TIMESTAMP → TIMESTAMP
--   TINYINT(1)           → BOOLEAN
--   ENUM(...)            → VARCHAR + CHECK
--   ENGINE=InnoDB 등     → 제거
--   INSERT IGNORE INTO   → INSERT ... ON CONFLICT DO NOTHING
--   `backtick`           → 쌍따옴표 (예약어만) 또는 소문자 무인용
--   INTERVAL N UNIT      → INTERVAL 'N units'
-- ============================================================

-- ── 0. 기존 테이블 정리 (재실행 안전) ──────────────────────────

DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS email_verifications CASCADE;
DROP TABLE IF EXISTS chat_members CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS deal CASCADE;
DROP TABLE IF EXISTS ticket CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS report CASCADE;
DROP TABLE IF EXISTS cs CASCADE;
DROP TABLE IF EXISTS category CASCADE;
DROP TABLE IF EXISTS notice CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ── 1. users ──────────────────────────────────────────────────

CREATE TABLE users (
    user_id           BIGSERIAL PRIMARY KEY,
    email             VARCHAR(255) NOT NULL,
    password          VARCHAR(255) NOT NULL,
    name              VARCHAR(50)  NOT NULL,
    role              VARCHAR(10)  NOT NULL DEFAULT 'USER'
                          CHECK (role IN ('USER','ADMIN')),
    status            VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
                          CHECK (status IN ('ACTIVE','SUSPENDED','DELETED')),
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    deleted_at        TIMESTAMP,
    nickname          VARCHAR(50),
    profile_image_url VARCHAR(255),
    provider          VARCHAR(20)  CHECK (provider IN ('KAKAO','NAVER','GOOGLE')),
    refresh_token     VARCHAR(255),
    last_login_at     TIMESTAMP,
    email_verified    BOOLEAN      NOT NULL DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    CONSTRAINT unique_email    UNIQUE (email),
    CONSTRAINT unique_nickname UNIQUE (nickname)
);

CREATE INDEX idx_users_email      ON users (email);
CREATE INDEX idx_users_status     ON users (status);
CREATE INDEX idx_users_created_at ON users (created_at);

-- ── 2. categories (계층형 티켓 카테고리) ──────────────────────

CREATE TABLE categories (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    depth      INT          NOT NULL,
    parent_id  BIGINT       REFERENCES categories (id) ON DELETE CASCADE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_parent_id ON categories (parent_id);
CREATE INDEX idx_categories_depth     ON categories (depth);

-- ── 3. ticket ─────────────────────────────────────────────────

CREATE TABLE ticket (
    ticket_id      BIGSERIAL PRIMARY KEY,
    event_name     VARCHAR(255)     NOT NULL,
    event_date     TIMESTAMP        NOT NULL,
    event_location VARCHAR(255)     NOT NULL,
    owner_id       BIGINT           NOT NULL REFERENCES users (user_id),
    ticket_status  VARCHAR(20)      NOT NULL DEFAULT 'AVAILABLE'
                       CHECK (ticket_status IN ('AVAILABLE','RESERVED','SOLD','USED','EXPIRED')),
    original_price NUMERIC(10,0)    NOT NULL,
    selling_price  NUMERIC(10,0),
    seat_info      VARCHAR(100),
    ticket_type    VARCHAR(50),
    category_id    BIGINT           NOT NULL REFERENCES categories (id),
    image1         VARCHAR(255),
    image2         VARCHAR(255),
    description    TEXT,
    trade_type     VARCHAR(20)      NOT NULL
                       CHECK (trade_type IN ('DELIVERY','ONSITE','OTHER')),
    created_at     TIMESTAMP        NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP        NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_owner_id     ON ticket (owner_id);
CREATE INDEX idx_ticket_category_id  ON ticket (category_id);
CREATE INDEX idx_ticket_status       ON ticket (ticket_status);
CREATE INDEX idx_ticket_event_date   ON ticket (event_date);

-- ── 4. deal ───────────────────────────────────────────────────

CREATE TABLE deal (
    deal_id       BIGSERIAL PRIMARY KEY,
    ticket_id     BIGINT       NOT NULL REFERENCES ticket (ticket_id),
    buyer_id      BIGINT       NOT NULL REFERENCES users (user_id),
    seller_id     BIGINT       NOT NULL REFERENCES users (user_id),
    deal_at       TIMESTAMP    NOT NULL,
    deal_status   VARCHAR(20)  NOT NULL
                      CHECK (deal_status IN ('PENDING','ACCEPTED','REJECTED','PAID','CANCELED','EXPIRED')),
    quantity      INT          NOT NULL,
    expire_at     TIMESTAMP    NOT NULL,
    cancel_reason VARCHAR(255)
);

-- ── 5. payments ───────────────────────────────────────────────

CREATE TABLE payments (
    payment_id           BIGSERIAL PRIMARY KEY,
    deal_id              BIGINT        NOT NULL REFERENCES deal (deal_id),
    buyer_id             BIGINT        NOT NULL REFERENCES users (user_id),
    seller_id            BIGINT        NOT NULL REFERENCES users (user_id),
    price                NUMERIC(10,0) NOT NULL,
    payment_status       VARCHAR(20)   NOT NULL
                             CHECK (payment_status IN ('WAIT_PAY','PAID','FAILED','CANCELLED')),
    payment_date         TIMESTAMP     NOT NULL,
    completion_date      TIMESTAMP,
    payment_method       VARCHAR(50)   NOT NULL,
    refund_amount        NUMERIC(10,0),
    refund_reason        VARCHAR(255),
    refund_date          TIMESTAMP,
    cancel_payment_reason VARCHAR(255),
    pg_tid               VARCHAR(100),
    pg_status            VARCHAR(50)
);

-- ── 6. report ─────────────────────────────────────────────────

CREATE TABLE report (
    id         BIGSERIAL    PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    content    TEXT         NOT NULL,
    status     VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    DEFAULT NOW()
);

-- ── 7. cs (고객지원) ──────────────────────────────────────────

CREATE TABLE cs (
    id          BIGSERIAL   PRIMARY KEY,
    user_id     BIGINT      NOT NULL,
    category_id BIGINT      NOT NULL,
    message     TEXT        NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ── 8. category (CS 카테고리) ─────────────────────────────────

CREATE TABLE category (
    id          BIGSERIAL    PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── 9. notice ─────────────────────────────────────────────────

CREATE TABLE notice (
    id          BIGSERIAL    PRIMARY KEY,
    title       VARCHAR(100) NOT NULL,
    content     TEXT         NOT NULL,
    category_id BIGINT,
    is_pinned   BOOLEAN      NOT NULL DEFAULT FALSE,
    is_visible  BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    DEFAULT NOW()
);

-- ── 10. chat_rooms ────────────────────────────────────────────

CREATE TABLE chat_rooms (
    chatroom_id     BIGSERIAL   PRIMARY KEY,
    ticket_id       BIGINT      NOT NULL,
    buyer_id        BIGINT      NOT NULL,
    seller_id       BIGINT      NOT NULL,
    last_message_id BIGINT,
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    room_status     VARCHAR(10) NOT NULL CHECK (room_status IN ('OPEN','LOCK')),
    deal_status     VARCHAR(20) NOT NULL CHECK (deal_status IN ('PENDING','REQUESTED','REJECTED','ACCEPTED'))
);

CREATE INDEX idx_chat_rooms_ticket_id ON chat_rooms (ticket_id);
CREATE INDEX idx_chat_rooms_buyer_id  ON chat_rooms (buyer_id);

-- ── 11. chat_messages ─────────────────────────────────────────

CREATE TABLE chat_messages (
    message_id  BIGSERIAL   PRIMARY KEY,
    chatroom_id BIGINT      NOT NULL,
    sender_id   BIGINT      NOT NULL,
    type        VARCHAR(30) NOT NULL
                    CHECK (type IN ('TEXT','SYSTEM_ACTION_MESSAGE','SYSTEM_INFO_MESSAGE')),
    content     TEXT        NOT NULL,
    sent_at     TIMESTAMP   NOT NULL DEFAULT NOW(),
    metadata    JSONB
);

CREATE INDEX idx_chat_messages_chatroom_sent_at ON chat_messages (chatroom_id, sent_at);
CREATE INDEX idx_chat_messages_sender_id        ON chat_messages (sender_id);

-- ── 12. chat_members ──────────────────────────────────────────

CREATE TABLE chat_members (
    id                   BIGSERIAL PRIMARY KEY,
    user_id              BIGINT    NOT NULL,
    chatroom_id          BIGINT    NOT NULL,
    last_read_message_id BIGINT,
    is_deleted           BOOLEAN   NOT NULL DEFAULT FALSE,
    CONSTRAINT uk_user_chatroom UNIQUE (user_id, chatroom_id)
);

-- ── 13. email_verifications ───────────────────────────────────

CREATE TABLE email_verifications (
    verification_id   BIGSERIAL    PRIMARY KEY,
    email             VARCHAR(255) NOT NULL,
    verification_code VARCHAR(6)   NOT NULL,
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    expires_at        TIMESTAMP    NOT NULL,
    verified          BOOLEAN      NOT NULL DEFAULT FALSE,
    verified_at       TIMESTAMP
);

CREATE INDEX idx_ev_email             ON email_verifications (email);
CREATE INDEX idx_ev_verification_code ON email_verifications (verification_code);
CREATE INDEX idx_ev_expires_at        ON email_verifications (expires_at);

-- ── 14. notifications ─────────────────────────────────────────

CREATE TABLE notifications (
    noti_id    BIGSERIAL   PRIMARY KEY,
    user_id    BIGINT      NOT NULL,
    type       VARCHAR(30) NOT NULL
                   CHECK (type IN ('deal_request','deal_accept','deal_reject','payment_request','chat','system')),
    message    TEXT,
    is_read    BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_type    ON notifications (type);
CREATE INDEX idx_notifications_is_read ON notifications (is_read);

-- ── 15. activities ────────────────────────────────────────────

CREATE TABLE activities (
    activity_id      BIGSERIAL   PRIMARY KEY,
    user_id          BIGINT      NOT NULL,
    related_user_id  BIGINT,
    activity_type    VARCHAR(20) NOT NULL
                         CHECK (activity_type IN ('PURCHASE','SALE','LIKE','REVIEW')),
    rating           INT,
    comment          TEXT,
    created_at       TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activities_user_id          ON activities (user_id);
CREATE INDEX idx_activities_related_user_id  ON activities (related_user_id);
CREATE INDEX idx_activities_activity_type    ON activities (activity_type);
CREATE INDEX idx_activities_created_at       ON activities (created_at);


-- ============================================================
-- 더미 데이터 (INSERT ... ON CONFLICT DO NOTHING)
-- ============================================================

-- ── 1. 사용자 (50명) ──────────────────────────────────────────

INSERT INTO users (email, password, name, role, status, nickname, profile_image_url, email_verified, last_login_at, email_verified_at) VALUES
('admin@passit.com', '$2a$10$YourHashedPasswordHere', '관리자', 'ADMIN', 'ACTIVE', 'admin', 'https://i.pravatar.cc/200?img=admin', TRUE, NOW(), NOW()),
('kim.minjun@gmail.com', '$2a$10$YourHashedPasswordHere', '김민준', 'USER', 'ACTIVE', '민준이', 'https://i.pravatar.cc/200?img=1', TRUE, NOW(), NOW()),
('lee.seoyoon@naver.com', '$2a$10$YourHashedPasswordHere', '이서윤', 'USER', 'ACTIVE', '서윤맘', 'https://i.pravatar.cc/200?img=2', TRUE, NOW(), NOW()),
('park.jiwoo@gmail.com', '$2a$10$YourHashedPasswordHere', '박지우', 'USER', 'ACTIVE', '지우짱', 'https://i.pravatar.cc/200?img=3', TRUE, NOW(), NOW()),
('choi.yujin@kakao.com', '$2a$10$YourHashedPasswordHere', '최유진', 'USER', 'ACTIVE', '유진언니', 'https://i.pravatar.cc/200?img=4', TRUE, NOW(), NOW()),
('jung.haneul@naver.com', '$2a$10$YourHashedPasswordHere', '정하늘', 'USER', 'ACTIVE', '하늘하늘', 'https://i.pravatar.cc/200?img=5', TRUE, NOW(), NOW()),
('kang.dohyun@gmail.com', '$2a$10$YourHashedPasswordHere', '강도현', 'USER', 'ACTIVE', '도현도현', 'https://i.pravatar.cc/200?img=6', TRUE, NOW(), NOW()),
('song.yuna@kakao.com', '$2a$10$YourHashedPasswordHere', '송유나', 'USER', 'ACTIVE', '유나티켓', 'https://i.pravatar.cc/200?img=7', TRUE, NOW(), NOW()),
('lim.siwoo@naver.com', '$2a$10$YourHashedPasswordHere', '임시우', 'USER', 'ACTIVE', '시우시우', 'https://i.pravatar.cc/200?img=8', TRUE, NOW(), NOW()),
('han.jisoo@gmail.com', '$2a$10$YourHashedPasswordHere', '한지수', 'USER', 'ACTIVE', '지수언니', 'https://i.pravatar.cc/200?img=9', TRUE, NOW(), NOW()),
('oh.minho@kakao.com', '$2a$10$YourHashedPasswordHere', '오민호', 'USER', 'ACTIVE', '민호형', 'https://i.pravatar.cc/200?img=10', TRUE, NOW(), NOW()),
('yoon.chaeyoung@naver.com', '$2a$10$YourHashedPasswordHere', '윤채영', 'USER', 'ACTIVE', '채영이', 'https://i.pravatar.cc/200?img=11', TRUE, NOW(), NOW()),
('jang.hyeonwoo@gmail.com', '$2a$10$YourHashedPasswordHere', '장현우', 'USER', 'ACTIVE', '현우오빠', 'https://i.pravatar.cc/200?img=12', TRUE, NOW(), NOW()),
('shin.areum@kakao.com', '$2a$10$YourHashedPasswordHere', '신아름', 'USER', 'ACTIVE', '아름다운', 'https://i.pravatar.cc/200?img=13', TRUE, NOW(), NOW()),
('kwon.junhee@naver.com', '$2a$10$YourHashedPasswordHere', '권준희', 'USER', 'ACTIVE', '준희야', 'https://i.pravatar.cc/200?img=14', TRUE, NOW(), NOW()),
('bae.sohee@gmail.com', '$2a$10$YourHashedPasswordHere', '배소희', 'USER', 'ACTIVE', '소희티켓', 'https://i.pravatar.cc/200?img=15', TRUE, NOW(), NOW()),
('seo.taehyung@kakao.com', '$2a$10$YourHashedPasswordHere', '서태형', 'USER', 'ACTIVE', '태형이형', 'https://i.pravatar.cc/200?img=16', TRUE, NOW(), NOW()),
('ahn.minji@naver.com', '$2a$10$YourHashedPasswordHere', '안민지', 'USER', 'ACTIVE', '민지언니', 'https://i.pravatar.cc/200?img=17', TRUE, NOW(), NOW()),
('nam.jihoon@gmail.com', '$2a$10$YourHashedPasswordHere', '남지훈', 'USER', 'ACTIVE', '지훈오빠', 'https://i.pravatar.cc/200?img=18', TRUE, NOW(), NOW()),
('moon.yeseul@kakao.com', '$2a$10$YourHashedPasswordHere', '문예슬', 'USER', 'ACTIVE', '예슬예슬', 'https://i.pravatar.cc/200?img=19', TRUE, NOW(), NOW()),
('hong.donghyun@naver.com', '$2a$10$YourHashedPasswordHere', '홍동현', 'USER', 'ACTIVE', '동현형', 'https://i.pravatar.cc/200?img=20', TRUE, NOW(), NOW()),
('go.sujin@gmail.com', '$2a$10$YourHashedPasswordHere', '고수진', 'USER', 'ACTIVE', '수진맘', 'https://i.pravatar.cc/200?img=21', TRUE, NOW(), NOW()),
('son.youngwoo@kakao.com', '$2a$10$YourHashedPasswordHere', '손영우', 'USER', 'ACTIVE', '영우야', 'https://i.pravatar.cc/200?img=22', TRUE, NOW(), NOW()),
('noh.hyejin@naver.com', '$2a$10$YourHashedPasswordHere', '노혜진', 'USER', 'ACTIVE', '혜진언니', 'https://i.pravatar.cc/200?img=23', TRUE, NOW(), NOW()),
('baek.sanghoon@gmail.com', '$2a$10$YourHashedPasswordHere', '백상훈', 'USER', 'ACTIVE', '상훈이형', 'https://i.pravatar.cc/200?img=24', TRUE, NOW(), NOW()),
('hwang.jimin@kakao.com', '$2a$10$YourHashedPasswordHere', '황지민', 'USER', 'ACTIVE', '지민이', 'https://i.pravatar.cc/200?img=25', TRUE, NOW(), NOW()),
('im.seungho@naver.com', '$2a$10$YourHashedPasswordHere', '임승호', 'USER', 'ACTIVE', '승호승호', 'https://i.pravatar.cc/200?img=26', TRUE, NOW(), NOW()),
('chu.yewon@gmail.com', '$2a$10$YourHashedPasswordHere', '추예원', 'USER', 'ACTIVE', '예원티켓', 'https://i.pravatar.cc/200?img=27', TRUE, NOW(), NOW()),
('yu.daehyun@kakao.com', '$2a$10$YourHashedPasswordHere', '유대현', 'USER', 'ACTIVE', '대현대현', 'https://i.pravatar.cc/200?img=28', TRUE, NOW(), NOW()),
('woo.sora@naver.com', '$2a$10$YourHashedPasswordHere', '우소라', 'USER', 'ACTIVE', '소라소라', 'https://i.pravatar.cc/200?img=29', TRUE, NOW(), NOW()),
('pyo.jungmin@gmail.com', '$2a$10$YourHashedPasswordHere', '표정민', 'USER', 'ACTIVE', '정민오빠', 'https://i.pravatar.cc/200?img=30', TRUE, NOW(), NOW()),
('ma.hyunji@kakao.com', '$2a$10$YourHashedPasswordHere', '마현지', 'USER', 'ACTIVE', '현지현지', 'https://i.pravatar.cc/200?img=31', TRUE, NOW(), NOW()),
('cha.wonbin@naver.com', '$2a$10$YourHashedPasswordHere', '차원빈', 'USER', 'ACTIVE', '원빈이형', 'https://i.pravatar.cc/200?img=32', TRUE, NOW(), NOW()),
('byun.seulgi@gmail.com', '$2a$10$YourHashedPasswordHere', '변슬기', 'USER', 'ACTIVE', '슬기언니', 'https://i.pravatar.cc/200?img=33', TRUE, NOW(), NOW()),
('sung.jaehyun@kakao.com', '$2a$10$YourHashedPasswordHere', '성재현', 'USER', 'ACTIVE', '재현오빠', 'https://i.pravatar.cc/200?img=34', TRUE, NOW(), NOW()),
('ra.seoyeon@naver.com', '$2a$10$YourHashedPasswordHere', '라서연', 'USER', 'ACTIVE', '서연티켓', 'https://i.pravatar.cc/200?img=35', TRUE, NOW(), NOW()),
('bang.minkyu@gmail.com', '$2a$10$YourHashedPasswordHere', '방민규', 'USER', 'ACTIVE', '민규야', 'https://i.pravatar.cc/200?img=36', TRUE, NOW(), NOW()),
('jin.hayoung@kakao.com', '$2a$10$YourHashedPasswordHere', '진하영', 'USER', 'ACTIVE', '하영언니', 'https://i.pravatar.cc/200?img=37', TRUE, NOW(), NOW()),
('ryoo.jaemin@naver.com', '$2a$10$YourHashedPasswordHere', '류재민', 'USER', 'ACTIVE', '재민이형', 'https://i.pravatar.cc/200?img=38', TRUE, NOW(), NOW()),
('myung.sohyun@gmail.com', '$2a$10$YourHashedPasswordHere', '명소현', 'USER', 'ACTIVE', '소현소현', 'https://i.pravatar.cc/200?img=39', TRUE, NOW(), NOW()),
('tae.jiseok@kakao.com', '$2a$10$YourHashedPasswordHere', '태지석', 'USER', 'ACTIVE', '지석오빠', 'https://i.pravatar.cc/200?img=40', TRUE, NOW(), NOW()),
('sim.dahyun@naver.com', '$2a$10$YourHashedPasswordHere', '심다현', 'USER', 'ACTIVE', '다현다현', 'https://i.pravatar.cc/200?img=41', TRUE, NOW(), NOW()),
('bin.woojin@gmail.com', '$2a$10$YourHashedPasswordHere', '빈우진', 'USER', 'ACTIVE', '우진이형', 'https://i.pravatar.cc/200?img=42', TRUE, NOW(), NOW()),
('eun.nari@kakao.com', '$2a$10$YourHashedPasswordHere', '은나리', 'USER', 'ACTIVE', '나리티켓', 'https://i.pravatar.cc/200?img=43', TRUE, NOW(), NOW()),
('yang.seungmin@naver.com', '$2a$10$YourHashedPasswordHere', '양승민', 'USER', 'ACTIVE', '승민승민', 'https://i.pravatar.cc/200?img=44', TRUE, NOW(), NOW()),
('geum.jiwon@gmail.com', '$2a$10$YourHashedPasswordHere', '금지원', 'USER', 'ACTIVE', '지원언니', 'https://i.pravatar.cc/200?img=45', TRUE, NOW(), NOW()),
('mo.kyunghoon@kakao.com', '$2a$10$YourHashedPasswordHere', '모경훈', 'USER', 'ACTIVE', '경훈이형', 'https://i.pravatar.cc/200?img=46', TRUE, NOW(), NOW()),
('pi.soobin@naver.com', '$2a$10$YourHashedPasswordHere', '피수빈', 'USER', 'ACTIVE', '수빈이', 'https://i.pravatar.cc/200?img=47', TRUE, NOW(), NOW()),
('sa.jungkook@gmail.com', '$2a$10$YourHashedPasswordHere', '사정국', 'USER', 'ACTIVE', '정국오빠', 'https://i.pravatar.cc/200?img=48', TRUE, NOW(), NOW()),
('ha.yerin@kakao.com', '$2a$10$YourHashedPasswordHere', '하예린', 'USER', 'ACTIVE', '예린예린', 'https://i.pravatar.cc/200?img=49', TRUE, NOW(), NOW()),
('gan.mingyu@naver.com', '$2a$10$YourHashedPasswordHere', '간민규', 'USER', 'ACTIVE', '민규티켓', 'https://i.pravatar.cc/200?img=50', TRUE, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ── 2. 티켓 카테고리 (계층형) ─────────────────────────────────

INSERT INTO categories (name, depth, parent_id) VALUES
('콘서트', 1, NULL), ('스포츠', 1, NULL), ('뮤지컬', 1, NULL),
('연극', 1, NULL), ('전시/행사', 1, NULL)
ON CONFLICT DO NOTHING;

INSERT INTO categories (name, depth, parent_id) VALUES
('아이돌', 2, 1), ('발라드', 2, 1), ('힙합/R&B', 2, 1),
('록/인디', 2, 1), ('트로트', 2, 1)
ON CONFLICT DO NOTHING;

INSERT INTO categories (name, depth, parent_id) VALUES
('야구', 2, 2), ('축구', 2, 2), ('농구', 2, 2),
('배구', 2, 2), ('E-스포츠', 2, 2)
ON CONFLICT DO NOTHING;

INSERT INTO categories (name, depth, parent_id) VALUES
('창작뮤지컬', 2, 3), ('라이선스뮤지컬', 2, 3),
('코미디', 2, 4), ('드라마', 2, 4),
('전시회', 2, 5), ('페스티벌', 2, 5)
ON CONFLICT DO NOTHING;

-- ── 3. 티켓 (100개) ───────────────────────────────────────────

INSERT INTO ticket (event_name, event_date, event_location, owner_id, ticket_status, original_price, selling_price, seat_info, ticket_type, category_id, description, trade_type) VALUES
('BTS WORLD TOUR 서울 앵콜', '2026-03-15 19:00:00', '잠실 올림픽 주경기장', 2, 'AVAILABLE', 150000, 140000, 'R석 3구역 15열 23번', '일반', 6, 'BTS 월드투어 서울 앵콜 콘서트입니다. 급하게 일정이 생겨서 양도합니다.', 'DELIVERY'),
('BTS WORLD TOUR 서울 앵콜', '2026-03-15 19:00:00', '잠실 올림픽 주경기장', 3, 'AVAILABLE', 150000, 145000, 'R석 2구역 10열 15번', '일반', 6, '좋은 자리입니다. 티켓 수령 후 사용 가능합니다.', 'DELIVERY'),
('BTS WORLD TOUR 서울 앵콜', '2026-03-16 18:00:00', '잠실 올림픽 주경기장', 4, 'SOLD', 150000, 150000, 'VIP석 1구역 5열 8번', 'VIP', 6, 'VIP석 양도합니다. 거래 완료되었습니다.', 'ONSITE'),
('BLACKPINK BORN PINK TOUR', '2026-02-20 19:00:00', '고척 스카이돔', 5, 'AVAILABLE', 132000, 125000, 'A구역 22열 11번', '일반', 6, '블핑 콘서트 티켓입니다. 친구가 못가게 되어 양도합니다.', 'DELIVERY'),
('BLACKPINK BORN PINK TOUR', '2026-02-20 19:00:00', '고척 스카이돔', 6, 'RESERVED', 132000, 130000, 'S구역 15열 20번', '일반', 6, '예약 중인 티켓입니다.', 'DELIVERY'),
('IU 콘서트 [The Golden Hour]', '2026-04-05 19:00:00', 'KSPO DOME', 7, 'AVAILABLE', 121000, 115000, 'R석 12열 5번', '일반', 6, '아이유 골든아워 콘서트 티켓 양도합니다.', 'DELIVERY'),
('IU 콘서트 [The Golden Hour]', '2026-04-06 19:00:00', 'KSPO DOME', 8, 'AVAILABLE', 121000, 121000, 'R석 8열 17번', '일반', 6, '정가 양도입니다. 빠른 거래 원합니다.', 'DELIVERY'),
('SEVENTEEN FOLLOW AGAIN', '2026-05-10 18:00:00', '서울 월드컵 경기장', 9, 'AVAILABLE', 143000, 140000, '스탠딩 B구역', '스탠딩', 6, '세븐틴 팔로우 어게인 투어 티켓입니다.', 'DELIVERY'),
('SEVENTEEN FOLLOW AGAIN', '2026-05-11 18:00:00', '서울 월드컵 경기장', 10, 'AVAILABLE', 143000, 135000, '스탠딩 A구역', '스탠딩', 6, '스탠딩 A구역 양도합니다. 급처!', 'DELIVERY'),
('NewJeans BUNNIES CAMP', '2026-03-28 19:00:00', 'KSPO DOME', 11, 'AVAILABLE', 99000, 95000, 'R석 20열 30번', '일반', 6, '뉴진스 버니즈 캠프 티켓 양도합니다.', 'DELIVERY'),
('임영웅 전국투어 [IM HERO]', '2026-02-15 18:00:00', '서울 올림픽 공원 올림픽홀', 12, 'AVAILABLE', 132000, 130000, 'VIP석 5열 12번', 'VIP', 10, '임영웅 콘서트 VIP석입니다. 정가에 가깝게 양도합니다.', 'DELIVERY'),
('임영웅 전국투어 [IM HERO]', '2026-02-16 18:00:00', '서울 올림픽 공원 올림픽홀', 13, 'AVAILABLE', 110000, 105000, 'R석 15열 8번', '일반', 10, '영웅시대 티켓 양도합니다.', 'DELIVERY'),
('EPIK HIGH IS HERE 2026', '2026-06-20 19:00:00', '올림픽공원 올림픽홀', 14, 'AVAILABLE', 99000, 90000, '스탠딩', '스탠딩', 8, '에픽하이 콘서트 스탠딩 티켓입니다.', 'DELIVERY'),
('잔나비 콘서트 [전설]', '2026-07-18 19:00:00', '올림픽공원 88잔디마당', 15, 'AVAILABLE', 77000, 75000, '자유석', '일반', 9, '잔나비 콘서트 티켓 양도합니다.', 'DELIVERY'),
('두산 베어스 vs LG 트윈스', '2026-04-12 18:00:00', '잠실야구장', 16, 'AVAILABLE', 30000, 25000, '외야 지정석 A', '일반', 11, '잠실 더비 경기! 두산 vs LG 티켓입니다.', 'ONSITE'),
('두산 베어스 vs LG 트윈스', '2026-04-12 18:00:00', '잠실야구장', 17, 'AVAILABLE', 30000, 28000, '외야 지정석 B', '일반', 11, '잠실 더비 예매했는데 일정이 생겨서 양도합니다.', 'ONSITE'),
('SSG 랜더스 vs 키움 히어로즈', '2026-05-03 18:00:00', '인천SSG랜더스필드', 18, 'AVAILABLE', 25000, 20000, '3루 테이블석', '일반', 11, 'SSG 홈경기 티켓입니다. 테이블석이라 편해요!', 'ONSITE'),
('KIA 타이거즈 vs 삼성 라이온즈', '2026-05-20 18:00:00', '광주-기아 챔피언스 필드', 19, 'AVAILABLE', 28000, 25000, '1루 지정석', '일반', 11, 'KIA vs 삼성 경기 티켓입니다.', 'DELIVERY'),
('한화 이글스 vs NC 다이노스', '2026-06-15 18:00:00', '대전한밭야구장', 20, 'AVAILABLE', 22000, 20000, '외야 자유석', '일반', 11, '한화 홈경기 티켓 양도합니다.', 'ONSITE'),
('FC 서울 vs 수원 삼성', '2026-04-05 19:00:00', '서울월드컵경기장', 21, 'AVAILABLE', 35000, 30000, 'W구역 중앙', '일반', 12, 'K리그 서울 더비 경기입니다!', 'ONSITE'),
('FC 서울 vs 수원 삼성', '2026-04-05 19:00:00', '서울월드컵경기장', 22, 'AVAILABLE', 35000, 32000, 'E구역 코너', '일반', 12, '급하게 일정이 생겨서 양도합니다.', 'ONSITE'),
('울산 현대 vs 전북 현대', '2026-05-10 19:00:00', '울산문수축구경기장', 23, 'AVAILABLE', 30000, 28000, 'A구역 지정석', '일반', 12, '울산 홈경기 티켓입니다.', 'DELIVERY'),
('서울 삼성 vs 인천 전자랜드', '2026-03-25 19:00:00', '잠실실내체육관', 24, 'AVAILABLE', 40000, 35000, '코트석 B', '일반', 13, 'KBL 경기 티켓입니다. 코트석이라 선수들 가까이서 볼 수 있어요!', 'ONSITE'),
('서울 SK vs 고양 캐롯', '2026-04-15 19:00:00', '잠실실내체육관', 25, 'AVAILABLE', 35000, 30000, '2층 지정석', '일반', 13, 'SK 농구 경기 티켓 양도합니다.', 'ONSITE'),
('현대캐피탈 vs 대한항공', '2026-03-30 14:00:00', '수원체육관', 26, 'AVAILABLE', 25000, 22000, 'B구역 10열', '일반', 14, '남자배구 경기 티켓입니다.', 'ONSITE'),
('흥국생명 vs GS칼텍스', '2026-04-20 14:00:00', '인천계양체육관', 27, 'AVAILABLE', 25000, 20000, 'C구역 15열', '일반', 14, '여자배구 경기 티켓 양도합니다.', 'ONSITE'),
('LCK 2026 Spring Finals', '2026-04-30 17:00:00', 'LoL PARK', 28, 'AVAILABLE', 50000, 45000, '일반석', '일반', 15, 'LCK 결승전 티켓입니다!', 'ONSITE'),
('Valorant Champions Tour', '2026-05-25 14:00:00', '상암 MBC 공개홀', 29, 'AVAILABLE', 40000, 35000, '지정석', '일반', 15, '발로란트 대회 티켓 양도합니다.', 'ONSITE'),
('뮤지컬 [레미제라블]', '2026-03-10 19:30:00', '블루스퀘어 신한카드홀', 30, 'AVAILABLE', 160000, 150000, 'VIP석 E열 15번', 'VIP', 16, '레미제라블 뮤지컬 VIP석 티켓입니다.', 'DELIVERY'),
('뮤지컬 [레미제라블]', '2026-03-11 14:00:00', '블루스퀘어 신한카드홀', 31, 'AVAILABLE', 130000, 125000, 'R석 L열 20번', '일반', 16, '마티네 공연 티켓 양도합니다.', 'DELIVERY'),
('뮤지컬 [라이온킹]', '2026-04-08 19:30:00', '샬롯데씨어터', 32, 'AVAILABLE', 170000, 160000, 'VIP석 C열 8번', 'VIP', 16, '라이온킹 VIP석입니다. 좋은 자리!', 'DELIVERY'),
('뮤지컬 [라이온킹]', '2026-04-09 19:30:00', '샬롯데씨어터', 33, 'AVAILABLE', 140000, 135000, 'R석 M열 12번', '일반', 16, '라이온킹 R석 양도합니다.', 'DELIVERY'),
('뮤지컬 [오페라의 유령]', '2026-05-15 19:30:00', '샬롯데씨어터', 34, 'AVAILABLE', 150000, 145000, 'VIP석 F열 10번', 'VIP', 17, '오페라의 유령 VIP석 티켓입니다.', 'DELIVERY'),
('뮤지컬 [위키드]', '2026-06-10 19:30:00', 'LG아트센터', 35, 'AVAILABLE', 140000, 130000, 'R석 K열 18번', '일반', 17, '위키드 뮤지컬 티켓 양도합니다.', 'DELIVERY'),
('뮤지컬 [맘마미아]', '2026-07-05 14:00:00', 'D-CUBE아트센터', 36, 'AVAILABLE', 110000, 100000, 'S석 N열 25번', '일반', 16, '맘마미아 뮤지컬 티켓입니다.', 'DELIVERY'),
('뮤지컬 [시카고]', '2026-03-20 19:30:00', '충무아트센터', 37, 'AVAILABLE', 120000, 110000, 'R석 J열 7번', '일반', 17, '시카고 뮤지컬 R석 양도합니다.', 'DELIVERY'),
('연극 [햄릿]', '2026-03-18 20:00:00', '대학로 아트원씨어터', 38, 'AVAILABLE', 50000, 45000, 'R석', '일반', 18, '햄릿 연극 티켓입니다.', 'ONSITE'),
('연극 [지하철 1호선]', '2026-04-25 19:30:00', '대학로 자유극장', 39, 'AVAILABLE', 45000, 40000, 'S석', '일반', 18, '지하철 1호선 연극 티켓 양도합니다.', 'ONSITE'),
('연극 [곰을 찾아서]', '2026-05-08 20:00:00', '대학로 동숭아트센터', 40, 'AVAILABLE', 40000, 35000, 'R석', '일반', 19, '코미디 연극입니다. 재밌어요!', 'ONSITE'),
('연극 [웃음꽃 만발]', '2026-06-12 19:00:00', '대학로 소극장', 41, 'AVAILABLE', 35000, 30000, '일반석', '일반', 18, '웃음꽃 만발 연극 티켓입니다.', 'ONSITE'),
('[전시] 모네에서 세잔까지', '2026-03-01 10:00:00', '국립중앙박물관', 42, 'AVAILABLE', 18000, 15000, '일반', '일반', 20, '인상파 전시회 티켓입니다.', 'DELIVERY'),
('[전시] 반 고흐 체험전', '2026-04-15 11:00:00', 'DDP', 43, 'AVAILABLE', 20000, 18000, '일반', '일반', 20, '반 고흐 체험전 티켓 양도합니다.', 'DELIVERY'),
('[전시] 팀버튼 특별전', '2026-05-20 10:00:00', '예술의전당', 44, 'AVAILABLE', 22000, 20000, '일반', '일반', 20, '팀버튼 전시회 티켓입니다.', 'DELIVERY'),
('울트라 코리아 2026', '2026-06-15 14:00:00', '서울 올림픽공원', 45, 'AVAILABLE', 220000, 200000, '3일권', '일반', 21, '울트라 코리아 3일권 티켓입니다.', 'DELIVERY'),
('월드 디제이 페스티벌', '2026-07-10 18:00:00', '서울월드컵경기장', 46, 'AVAILABLE', 150000, 140000, '1일권', '일반', 21, 'WDF 티켓 양도합니다.', 'DELIVERY'),
('태연 콘서트 [The ODD of LOVE]', '2026-02-28 19:00:00', 'KSPO DOME', 47, 'AVAILABLE', 110000, 105000, 'R석 18열 22번', '일반', 6, '태연 콘서트 티켓 양도합니다.', 'DELIVERY'),
('엔시티 드림 콘서트', '2026-03-22 19:00:00', '올림픽공원 올림픽홀', 48, 'AVAILABLE', 121000, 115000, 'S구역 12열 10번', '일반', 6, '엔시티드림 콘서트 티켓입니다.', 'DELIVERY'),
('르세라핌 투어 콘서트', '2026-04-18 19:00:00', '고척 스카이돔', 49, 'AVAILABLE', 132000, 125000, 'A구역 20열 5번', '일반', 6, '르세라핌 콘서트 티켓 양도합니다.', 'DELIVERY'),
('에스파 월드투어', '2026-05-05 19:00:00', '잠실 실내체육관', 50, 'AVAILABLE', 132000, 130000, 'R석 15열 18번', '일반', 6, '에스파 콘서트 티켓입니다.', 'DELIVERY'),
('폴킴 콘서트 [Every Moment]', '2026-03-12 19:00:00', '올림픽공원 올림픽홀', 2, 'AVAILABLE', 88000, 85000, 'R석 10열 12번', '일반', 7, '폴킴 콘서트 티켓 양도합니다.', 'DELIVERY'),
('백예린 콘서트', '2026-04-22 19:00:00', '블루스퀘어 마스터카드홀', 3, 'AVAILABLE', 99000, 95000, 'R석 8열 15번', '일반', 7, '백예린 콘서트 티켓입니다.', 'DELIVERY'),
('성시경 콘서트 [Spring]', '2026-05-08 19:00:00', '잠실 실내체육관', 4, 'AVAILABLE', 121000, 115000, 'VIP석 6열 9번', 'VIP', 7, '성시경 콘서트 VIP석 양도합니다.', 'DELIVERY'),
('제이홉 솔로 콘서트', '2026-06-05 19:00:00', '고척 스카이돔', 5, 'AVAILABLE', 143000, 140000, 'VIP석 4열 11번', 'VIP', 8, '제이홉 솔로 콘서트 VIP석입니다.', 'DELIVERY'),
('지코 콘서트 [SHOW ME THE KING]', '2026-07-15 19:00:00', 'KSPO DOME', 6, 'AVAILABLE', 110000, 105000, 'R석 12열 20번', '일반', 8, '지코 콘서트 티켓 양도합니다.', 'DELIVERY'),
('혁오 콘서트', '2026-03-25 19:00:00', '올림픽공원 88잔디마당', 7, 'AVAILABLE', 88000, 85000, '자유석', '일반', 9, '혁오 콘서트 티켓입니다.', 'DELIVERY'),
('이날치 콘서트', '2026-04-30 19:00:00', '블루스퀘어 마스터카드홀', 8, 'AVAILABLE', 77000, 75000, 'R석', '일반', 9, '이날치 콘서트 티켓 양도합니다.', 'DELIVERY'),
('넬 콘서트 [BREAK THE SILENCE]', '2026-05-18 19:00:00', 'YES24 라이브홀', 9, 'AVAILABLE', 99000, 95000, 'R석 15열 8번', '일반', 9, '넬 콘서트 티켓입니다.', 'DELIVERY'),
('송가인 전국투어', '2026-02-25 18:00:00', '잠실 실내체육관', 10, 'AVAILABLE', 110000, 105000, 'R석 18열 25번', '일반', 10, '송가인 콘서트 티켓 양도합니다.', 'DELIVERY'),
('영탁 콘서트 [내일은 미스터트롯]', '2026-03-08 18:00:00', '올림픽공원 올림픽홀', 11, 'AVAILABLE', 99000, 95000, 'S석 12열 15번', '일반', 10, '영탁 콘서트 티켓입니다.', 'DELIVERY'),
('장윤정 콘서트', '2026-04-12 18:00:00', '세종문화회관', 12, 'AVAILABLE', 88000, 85000, 'R석 10열 20번', '일반', 10, '장윤정 콘서트 티켓 양도합니다.', 'DELIVERY'),
('KT 위즈 vs 롯데 자이언츠', '2026-07-05 18:00:00', '수원KT위즈파크', 13, 'AVAILABLE', 28000, 25000, '1루 지정석', '일반', 11, 'KT 홈경기 티켓입니다.', 'ONSITE'),
('LG 트윈스 vs 키움 히어로즈', '2026-07-20 18:00:00', '잠실야구장', 14, 'AVAILABLE', 30000, 28000, '외야 지정석', '일반', 11, 'LG vs 키움 경기 티켓입니다.', 'ONSITE'),
('삼성 라이온즈 vs NC 다이노스', '2026-08-10 18:00:00', '대구삼성라이온즈파크', 15, 'AVAILABLE', 25000, 22000, '3루 테이블석', '일반', 11, '삼성 홈경기 티켓 양도합니다.', 'ONSITE'),
('포항 스틸러스 vs 대구 FC', '2026-06-08 19:00:00', '포항스틸야드', 16, 'AVAILABLE', 25000, 22000, 'A구역', '일반', 12, '포항 홈경기 티켓입니다.', 'ONSITE'),
('제주 유나이티드 vs 강원 FC', '2026-07-12 19:00:00', '제주월드컵경기장', 17, 'AVAILABLE', 28000, 25000, 'B구역', '일반', 12, '제주 홈경기 티켓 양도합니다.', 'ONSITE'),
('뮤지컬 [아이다]', '2026-08-15 19:30:00', '세종문화회관', 18, 'AVAILABLE', 130000, 125000, 'R석 K열 15번', '일반', 16, '아이다 뮤지컬 티켓입니다.', 'DELIVERY'),
('뮤지컬 [킹키부츠]', '2026-09-10 19:30:00', '블루스퀘어 신한카드홀', 19, 'AVAILABLE', 140000, 135000, 'VIP석 E열 12번', 'VIP', 17, '킹키부츠 VIP석 양도합니다.', 'DELIVERY'),
('뮤지컬 [체스]', '2026-10-05 19:30:00', 'LG아트센터', 20, 'AVAILABLE', 120000, 115000, 'R석 L열 18번', '일반', 16, '체스 뮤지컬 티켓입니다.', 'DELIVERY'),
('연극 [맥베스]', '2026-08-20 20:00:00', '대학로 아트원씨어터', 21, 'AVAILABLE', 50000, 45000, 'R석', '일반', 19, '맥베스 연극 티켓 양도합니다.', 'ONSITE'),
('연극 [오셀로]', '2026-09-15 19:30:00', '대학로 자유극장', 22, 'AVAILABLE', 45000, 40000, 'S석', '일반', 19, '오셀로 연극 티켓입니다.', 'ONSITE'),
('[전시] 피카소 특별전', '2026-07-01 10:00:00', '서울시립미술관', 23, 'AVAILABLE', 25000, 22000, '일반', '일반', 20, '피카소 전시회 티켓입니다.', 'DELIVERY'),
('[전시] 클림트 & 쉴레', '2026-08-05 11:00:00', '예술의전당', 24, 'AVAILABLE', 23000, 20000, '일반', '일반', 20, '클림트 & 쉴레 전시 티켓 양도합니다.', 'DELIVERY'),
('인천 펜타포트 락 페스티벌', '2026-08-15 12:00:00', '인천 송도 달빛축제공원', 25, 'AVAILABLE', 180000, 170000, '3일권', '일반', 21, '펜타포트 3일권 티켓입니다.', 'DELIVERY'),
('지산 밸리 록 페스티벌', '2026-07-25 12:00:00', '이천 지산포레스트리조트', 26, 'AVAILABLE', 200000, 190000, '3일권', '일반', 21, '지산 밸리 락 페스티벌 티켓 양도합니다.', 'DELIVERY')
ON CONFLICT DO NOTHING;

-- ── 티켓 이미지 업데이트 ────────────────────────────────────

UPDATE ticket SET
    image1 = CONCAT('https://picsum.photos/800/600?random=', ticket_id),
    image2 = CONCAT('https://picsum.photos/800/600?random=', ticket_id::text || '000')
WHERE category_id IN (6, 7, 8, 9, 10);

UPDATE ticket SET
    image1 = CONCAT('https://picsum.photos/800/600?random=', ticket_id::text || '2'),
    image2 = CONCAT('https://picsum.photos/800/600?random=', ticket_id::text || '3')
WHERE category_id IN (11, 12, 13, 14, 15);

UPDATE ticket SET
    image1 = CONCAT('https://picsum.photos/800/600?random=', ticket_id::text || '4'),
    image2 = CONCAT('https://picsum.photos/800/600?random=', ticket_id::text || '5')
WHERE category_id IN (16, 17, 18, 19, 20, 21);

-- ── 4. CS 카테고리 ───────────────────────────────────────────

INSERT INTO category (name, description) VALUES
('계정 문의', '계정 관련 문의사항'),
('티켓 문의', '티켓 등록 및 판매 관련'),
('거래 문의', '거래 진행 및 결제 관련'),
('신고', '사기 및 부적절한 행위 신고'),
('기타', '기타 문의사항')
ON CONFLICT DO NOTHING;

-- ── 5. 거래(Deal) 데이터 ─────────────────────────────────────

INSERT INTO deal (ticket_id, buyer_id, seller_id, deal_at, deal_status, quantity, expire_at, cancel_reason) VALUES
(3, 10, 4, '2026-01-05 14:30:00', 'PAID', 1, '2026-01-06 14:30:00', NULL),
(5, 8, 6, '2026-01-08 16:20:00', 'ACCEPTED', 1, '2026-01-09 16:20:00', NULL),
(1, 15, 2, '2026-01-10 10:00:00', 'PENDING', 1, '2026-01-13 10:00:00', NULL),
(2, 12, 3, '2026-01-11 11:30:00', 'PENDING', 1, '2026-01-14 11:30:00', NULL),
(4, 20, 5, '2026-01-11 14:00:00', 'ACCEPTED', 1, '2026-01-12 14:00:00', NULL),
(6, 25, 7, '2026-01-12 09:00:00', 'PENDING', 1, '2026-01-15 09:00:00', NULL),
(7, 18, 8, '2026-01-12 15:30:00', 'PENDING', 1, '2026-01-15 15:30:00', NULL),
(8, 22, 9, '2026-01-12 16:45:00', 'ACCEPTED', 1, '2026-01-13 16:45:00', NULL),
(9, 28, 10, '2026-01-12 17:00:00', 'PENDING', 1, '2026-01-15 17:00:00', NULL),
(10, 30, 11, '2026-01-12 18:20:00', 'ACCEPTED', 1, '2026-01-13 18:20:00', NULL),
(11, 16, 12, '2026-01-05 10:00:00', 'REJECTED', 1, '2026-01-06 10:00:00', '판매자가 거절했습니다.'),
(12, 19, 13, '2026-01-06 11:00:00', 'CANCELED', 1, '2026-01-07 11:00:00', '구매자가 취소했습니다.'),
(14, 24, 14, '2026-01-09 13:00:00', 'PENDING', 1, '2026-01-12 13:00:00', NULL),
(16, 26, 16, '2026-01-10 14:00:00', 'ACCEPTED', 1, '2026-01-11 14:00:00', NULL),
(17, 27, 17, '2026-01-10 15:00:00', 'PAID', 1, '2026-01-11 15:00:00', NULL),
(18, 29, 18, '2026-01-11 10:30:00', 'PENDING', 1, '2026-01-14 10:30:00', NULL),
(19, 31, 19, '2026-01-11 11:45:00', 'ACCEPTED', 1, '2026-01-12 11:45:00', NULL),
(20, 32, 20, '2026-01-11 13:00:00', 'PENDING', 1, '2026-01-14 13:00:00', NULL),
(21, 33, 21, '2026-01-11 14:15:00', 'PAID', 1, '2026-01-12 14:15:00', NULL),
(22, 34, 22, '2026-01-11 15:30:00', 'ACCEPTED', 1, '2026-01-12 15:30:00', NULL),
(23, 35, 23, '2026-01-11 16:00:00', 'PENDING', 1, '2026-01-14 16:00:00', NULL),
(24, 36, 24, '2026-01-11 17:00:00', 'ACCEPTED', 1, '2026-01-12 17:00:00', NULL),
(25, 37, 25, '2026-01-12 09:30:00', 'PENDING', 1, '2026-01-15 09:30:00', NULL),
(26, 38, 26, '2026-01-12 10:00:00', 'PAID', 1, '2026-01-13 10:00:00', NULL),
(27, 39, 27, '2026-01-12 11:00:00', 'ACCEPTED', 1, '2026-01-13 11:00:00', NULL),
(28, 40, 28, '2026-01-12 12:00:00', 'PENDING', 1, '2026-01-15 12:00:00', NULL),
(29, 41, 29, '2026-01-12 13:00:00', 'ACCEPTED', 1, '2026-01-13 13:00:00', NULL),
(30, 42, 30, '2026-01-12 14:00:00', 'PAID', 1, '2026-01-13 14:00:00', NULL),
(31, 43, 31, '2026-01-12 15:00:00', 'PENDING', 1, '2026-01-15 15:00:00', NULL),
(32, 44, 32, '2026-01-12 16:00:00', 'ACCEPTED', 1, '2026-01-13 16:00:00', NULL),
(33, 45, 33, '2026-01-11 09:00:00', 'CANCELED', 1, '2026-01-12 09:00:00', '구매자 사정으로 취소'),
(34, 46, 34, '2026-01-11 10:00:00', 'REJECTED', 1, '2026-01-12 10:00:00', '판매자가 거절'),
(35, 47, 35, '2026-01-12 08:00:00', 'PENDING', 1, '2026-01-15 08:00:00', NULL),
(36, 48, 36, '2026-01-12 09:00:00', 'ACCEPTED', 1, '2026-01-13 09:00:00', NULL),
(37, 49, 37, '2026-01-12 10:00:00', 'PAID', 1, '2026-01-13 10:00:00', NULL),
(38, 50, 38, '2026-01-12 11:00:00', 'PENDING', 1, '2026-01-15 11:00:00', NULL),
(40, 12, 40, '2026-01-10 12:00:00', 'CANCELED', 1, '2026-01-11 12:00:00', '기간 만료'),
(42, 14, 42, '2026-01-11 13:00:00', 'ACCEPTED', 1, '2026-01-12 13:00:00', NULL),
(43, 16, 43, '2026-01-11 14:00:00', 'PAID', 1, '2026-01-12 14:00:00', NULL),
(44, 18, 44, '2026-01-11 15:00:00', 'PENDING', 1, '2026-01-14 15:00:00', NULL),
(45, 20, 45, '2026-01-11 16:00:00', 'ACCEPTED', 1, '2026-01-12 16:00:00', NULL),
(46, 22, 46, '2026-01-11 17:00:00', 'PAID', 1, '2026-01-12 17:00:00', NULL),
(47, 24, 47, '2026-01-12 08:30:00', 'PENDING', 1, '2026-01-15 08:30:00', NULL),
(48, 26, 48, '2026-01-12 09:30:00', 'ACCEPTED', 1, '2026-01-13 09:30:00', NULL),
(49, 28, 49, '2026-01-12 10:30:00', 'PAID', 1, '2026-01-13 10:30:00', NULL),
(50, 30, 50, '2026-01-12 11:30:00', 'PENDING', 1, '2026-01-15 11:30:00', NULL)
ON CONFLICT DO NOTHING;

-- ── 6. 채팅방 ─────────────────────────────────────────────────

INSERT INTO chat_rooms (ticket_id, buyer_id, seller_id, room_status, deal_status) VALUES
(1,  15, 2,  'OPEN', 'PENDING'),   (2,  12, 3,  'OPEN', 'PENDING'),
(4,  20, 5,  'OPEN', 'REQUESTED'), (6,  25, 7,  'OPEN', 'PENDING'),
(7,  18, 8,  'OPEN', 'PENDING'),   (8,  22, 9,  'OPEN', 'REQUESTED'),
(9,  28, 10, 'OPEN', 'PENDING'),   (10, 30, 11, 'OPEN', 'ACCEPTED'),
(3,  10, 4,  'LOCK', 'ACCEPTED'),  (5,  8,  6,  'LOCK', 'ACCEPTED'),
(14, 24, 14, 'OPEN', 'PENDING'),   (16, 26, 16, 'OPEN', 'REQUESTED'),
(17, 27, 17, 'LOCK', 'ACCEPTED'),  (18, 29, 18, 'OPEN', 'PENDING'),
(19, 31, 19, 'OPEN', 'REQUESTED'), (20, 32, 20, 'OPEN', 'PENDING'),
(21, 33, 21, 'LOCK', 'ACCEPTED'),  (22, 34, 22, 'OPEN', 'REQUESTED'),
(23, 35, 23, 'OPEN', 'PENDING'),   (24, 36, 24, 'OPEN', 'REQUESTED'),
(25, 37, 25, 'OPEN', 'PENDING'),   (26, 38, 26, 'LOCK', 'ACCEPTED'),
(27, 39, 27, 'OPEN', 'REQUESTED'), (28, 40, 28, 'OPEN', 'PENDING'),
(29, 41, 29, 'OPEN', 'REQUESTED'), (30, 42, 30, 'LOCK', 'ACCEPTED'),
(31, 43, 31, 'OPEN', 'PENDING'),   (32, 44, 32, 'OPEN', 'REQUESTED'),
(35, 47, 35, 'OPEN', 'PENDING'),   (36, 48, 36, 'OPEN', 'REQUESTED')
ON CONFLICT DO NOTHING;

-- ── 7. 채팅 메시지 ────────────────────────────────────────────

INSERT INTO chat_messages (chatroom_id, sender_id, type, content, sent_at) VALUES
(1, 15, 'TEXT', '안녕하세요! BTS 콘서트 티켓 구매하고 싶습니다.', '2026-01-10 10:01:00'),
(1, 2,  'TEXT', '안녕하세요~ 구매 의사 있으시면 바로 거래 가능합니다!', '2026-01-10 10:03:00'),
(1, 15, 'TEXT', '좌석이 어떤가요? 시야 괜찮을까요?', '2026-01-10 10:05:00'),
(1, 2,  'TEXT', 'R석 3구역인데 무대가 정면으로 잘 보이는 자리입니다.', '2026-01-10 10:07:00'),
(1, 15, 'TEXT', '좋네요! 거래 방식은 어떻게 되나요?', '2026-01-10 10:10:00'),
(1, 2,  'TEXT', '배송으로 보내드릴게요. 입금 확인 후 바로 발송합니다.', '2026-01-10 10:12:00'),
(2, 12, 'TEXT', '안녕하세요. 티켓 아직 있나요?', '2026-01-11 11:31:00'),
(2, 3,  'TEXT', '네 아직 있습니다!', '2026-01-11 11:33:00'),
(2, 12, 'TEXT', '가격 협의 가능할까요?', '2026-01-11 11:35:00'),
(2, 3,  'TEXT', '죄송하지만 정가로 거래하고 싶습니다.', '2026-01-11 11:37:00'),
(2, 12, 'TEXT', '알겠습니다. 그럼 정가로 구매하겠습니다.', '2026-01-11 11:40:00'),
(3, 10, 'TEXT', '안녕하세요. VIP석 구매하고 싶어요.', '2026-01-05 14:00:00'),
(3, 4,  'TEXT', '네 구매 의사 있으시면 바로 거래 진행하겠습니다.', '2026-01-05 14:02:00'),
(3, 10, 'TEXT', '현장 거래 가능한가요?', '2026-01-05 14:05:00'),
(3, 4,  'TEXT', '네 가능합니다. 강남역 근처에서 만나실 수 있나요?', '2026-01-05 14:07:00'),
(3, 10, 'TEXT', '좋아요! 내일 저녁 7시 어떠세요?', '2026-01-05 14:10:00'),
(3, 4,  'TEXT', '네 괜찮습니다. 강남역 2번 출구로 할까요?', '2026-01-05 14:12:00'),
(3, 10, 'SYSTEM_ACTION_MESSAGE', '거래가 완료되었습니다.', '2026-01-05 14:30:00'),
(4, 20, 'TEXT', '블핑 티켓 구매 희망합니다!', '2026-01-10 14:01:00'),
(4, 5,  'TEXT', '안녕하세요! 관심 가져주셔서 감사합니다.', '2026-01-10 14:03:00'),
(4, 20, 'TEXT', '언제까지 입금하면 되나요?', '2026-01-10 14:05:00'),
(4, 5,  'TEXT', '오늘 밤 12시까지 입금해주시면 됩니다.', '2026-01-10 14:07:00'),
(5, 8,  'TEXT', '안녕하세요. 아이유 콘서트 티켓 문의드립니다.', '2026-01-08 16:00:00'),
(5, 6,  'TEXT', '네 문의 주셔서 감사합니다!', '2026-01-08 16:02:00'),
(5, 8,  'TEXT', '좌석 위치 확인 가능할까요?', '2026-01-08 16:05:00'),
(5, 6,  'TEXT', 'S구역 15열 20번입니다. 무대에서 가까운 편이에요.', '2026-01-08 16:07:00'),
(5, 8,  'TEXT', '좋네요! 바로 구매하겠습니다.', '2026-01-08 16:10:00'),
(5, 6,  'SYSTEM_ACTION_MESSAGE', '양도 요청이 수락되었습니다.', '2026-01-08 16:20:00'),
(6, 25, 'TEXT', '세븐틴 티켓 구매하고 싶습니다.', '2026-01-12 09:01:00'),
(6, 7,  'TEXT', '안녕하세요~ 관심 가져주셔서 감사합니다.', '2026-01-12 09:03:00'),
(6, 25, 'TEXT', '스탠딩이면 입장 번호가 있나요?', '2026-01-12 09:05:00'),
(6, 7,  'TEXT', '네 B구역 300번대 입니다.', '2026-01-12 09:07:00'),
(7, 18, 'TEXT', '뉴진스 티켓 아직 판매 중인가요?', '2026-01-12 15:31:00'),
(7, 8,  'TEXT', '네 아직 있습니다!', '2026-01-12 15:33:00'),
(7, 18, 'TEXT', '가격 네고 안되나요?', '2026-01-12 15:35:00'),
(7, 8,  'TEXT', '5천원 정도는 가능할 것 같아요.', '2026-01-12 15:37:00'),
(8, 22, 'TEXT', '임영웅 콘서트 티켓 문의드립니다.', '2026-01-12 16:46:00'),
(8, 9,  'TEXT', '네 문의 주셔서 감사합니다.', '2026-01-12 16:48:00'),
(8, 22, 'TEXT', 'VIP석이면 혜택이 어떻게 되나요?', '2026-01-12 16:50:00'),
(8, 9,  'TEXT', 'VIP는 포토카드랑 굿즈가 포함되어 있습니다.', '2026-01-12 16:52:00'),
(8, 22, 'SYSTEM_ACTION_MESSAGE', '양도 요청을 보냈습니다.', '2026-01-12 16:55:00'),
(9, 28, 'TEXT', '에픽하이 콘서트 티켓 구매 희망합니다.', '2026-01-12 17:01:00'),
(9, 10, 'TEXT', '안녕하세요! 구매 의사 있으시면 바로 진행하겠습니다.', '2026-01-12 17:03:00'),
(9, 28, 'TEXT', '스탠딩이라 좀 걱정되는데 괜찮을까요?', '2026-01-12 17:05:00'),
(9, 10, 'TEXT', '에픽하이 공연은 스탠딩이 훨씬 재밌습니다!', '2026-01-12 17:07:00'),
(10, 30, 'TEXT', '잔나비 티켓 구매하고 싶습니다!', '2026-01-12 18:21:00'),
(10, 11, 'TEXT', '네 감사합니다. 자유석이라 편하게 보실 수 있어요.', '2026-01-12 18:23:00'),
(10, 30, 'TEXT', '바로 구매 진행할게요!', '2026-01-12 18:25:00'),
(10, 11, 'SYSTEM_ACTION_MESSAGE', '양도 요청이 수락되었습니다.', '2026-01-12 18:27:00')
ON CONFLICT DO NOTHING;

-- ── 8. 신고 ──────────────────────────────────────────────────

INSERT INTO report (user_id, content, status) VALUES
(15, '사기 의심 거래가 있어서 신고합니다. 티켓을 받지 못했습니다.', 'PENDING'),
(20, '부적절한 메시지를 받았습니다.', 'PENDING'),
(25, '허위 티켓 판매 의심됩니다.', 'RESOLVED'),
(12, '욕설을 사용하는 판매자를 신고합니다.', 'RESOLVED'),
(18, '가격을 속이는 판매자가 있습니다.', 'PENDING'),
(22, '티켓을 여러 명에게 중복 판매하는 것 같습니다.', 'IN_PROGRESS'),
(28, '사기 거래 신고합니다.', 'PENDING'),
(30, '판매자가 연락이 두절되었습니다.', 'IN_PROGRESS'),
(16, '허위 정보로 티켓을 판매하고 있습니다.', 'RESOLVED'),
(24, '부적절한 행위를 하는 사용자 신고합니다.', 'PENDING'),
(26, '티켓 가격을 과도하게 높게 책정했습니다.', 'PENDING'),
(32, '사기 거래 의심됩니다.', 'IN_PROGRESS'),
(36, '판매자가 약속을 지키지 않았습니다.', 'PENDING'),
(40, '부적절한 채팅 메시지를 받았습니다.', 'RESOLVED'),
(44, '허위 티켓 판매자를 신고합니다.', 'PENDING')
ON CONFLICT DO NOTHING;

-- ── 9. 고객지원 ───────────────────────────────────────────────

INSERT INTO cs (user_id, category_id, message, status) VALUES
(2, 1, '비밀번호를 변경하고 싶은데 어떻게 해야 하나요?', 'CLOSED'),
(5, 1, '계정이 잠겼습니다. 도움이 필요합니다.', 'OPEN'),
(10, 1, '이메일 인증이 안됩니다.', 'IN_PROGRESS'),
(15, 1, '프로필 사진 변경이 안되는데 확인 부탁드립니다.', 'OPEN'),
(3, 2, '티켓 등록 시 카테고리를 잘못 선택했는데 수정할 수 있나요?', 'CLOSED'),
(7, 2, '티켓 사진 업로드가 안됩니다.', 'IN_PROGRESS'),
(12, 2, '등록한 티켓을 삭제하고 싶습니다.', 'OPEN'),
(18, 2, '티켓 정보 수정이 필요합니다.', 'OPEN'),
(22, 2, '티켓 등록 후 승인까지 얼마나 걸리나요?', 'CLOSED'),
(4, 3, '결제를 했는데 티켓을 받지 못했습니다.', 'IN_PROGRESS'),
(8, 3, '환불 처리는 어떻게 하나요?', 'OPEN'),
(14, 3, '거래 취소를 하고 싶습니다.', 'CLOSED'),
(20, 3, '입금했는데 확인이 안되나요?', 'IN_PROGRESS'),
(25, 3, '티켓 배송 추적은 어떻게 하나요?', 'OPEN'),
(6, 4, '사기 거래를 당했습니다. 도와주세요.', 'IN_PROGRESS'),
(16, 4, '부적절한 사용자를 신고합니다.', 'OPEN'),
(9, 5, '앱 사용 중 오류가 발생했습니다.', 'OPEN'),
(19, 5, '기능 개선 제안을 하고 싶습니다.', 'CLOSED'),
(24, 5, '이벤트 문의드립니다.', 'OPEN'),
(30, 5, '서비스 이용 방법을 알고 싶습니다.', 'CLOSED')
ON CONFLICT DO NOTHING;

-- ── 10. 공지사항 ──────────────────────────────────────────────

INSERT INTO notice (title, content, category_id, is_pinned, is_visible, created_at, updated_at) VALUES
('[공지] Passit 서비스 오픈 안내', 'Passit 티켓 양도 플랫폼이 정식 오픈했습니다! 안전하고 편리한 티켓 거래 서비스를 이용해보세요.', 1, TRUE, TRUE, '2026-01-01 10:00:00', '2026-01-01 10:00:00'),
('[이벤트] 신규 회원 가입 이벤트', '신규 회원 가입 시 첫 거래 수수료 무료! 지금 바로 가입하세요.', 2, FALSE, TRUE, '2026-01-02 14:00:00', '2026-01-02 14:00:00'),
('[공지] 설 연휴 고객센터 운영 안내', '설 연휴 기간(2/9~2/12) 고객센터 운영 시간이 변경됩니다. 양해 부탁드립니다.', 1, FALSE, TRUE, '2026-01-05 09:00:00', '2026-01-05 09:00:00'),
('[업데이트] 새로운 기능 추가 안내', '채팅 기능이 개선되었습니다. 더욱 편리하게 판매자와 소통하세요!', 3, FALSE, TRUE, '2026-01-07 11:00:00', '2026-01-07 11:00:00'),
('[공지] 사기 거래 예방 안내', '안전한 거래를 위해 사기 거래 예방 가이드를 확인하세요.', 1, TRUE, TRUE, '2026-01-08 15:00:00', '2026-01-08 15:00:00'),
('[이벤트] 친구 추천 이벤트', '친구를 추천하고 포인트를 받으세요! 추천인과 피추천인 모두에게 혜택이 주어집니다.', 2, FALSE, TRUE, '2026-01-09 10:00:00', '2026-01-09 10:00:00'),
('[공지] 개인정보 처리방침 변경 안내', '개인정보 처리방침이 일부 변경되었습니다. 자세한 내용을 확인해주세요.', 1, FALSE, TRUE, '2026-01-10 13:00:00', '2026-01-10 13:00:00'),
('[업데이트] 모바일 앱 업데이트 안내', '모바일 앱이 업데이트 되었습니다. 최신 버전으로 업데이트해주세요.', 3, FALSE, TRUE, '2026-01-11 09:00:00', '2026-01-11 09:00:00'),
('[이벤트] 거래 후기 이벤트', '거래 후기를 작성하고 추첨을 통해 푸짐한 경품을 받아가세요!', 2, FALSE, TRUE, '2026-01-11 16:00:00', '2026-01-11 16:00:00'),
('[공지] 티켓 등록 가이드', '티켓을 처음 등록하시나요? 티켓 등록 가이드를 확인하세요.', 3, FALSE, TRUE, '2026-01-12 10:00:00', '2026-01-12 10:00:00')
ON CONFLICT DO NOTHING;
