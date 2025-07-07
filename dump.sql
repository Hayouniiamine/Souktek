--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: sync_products_id_seq(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sync_products_id_seq() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  PERFORM setval('public.products_id_seq', (SELECT MAX(id) FROM products));
  RETURN NULL;
END;
$$;


ALTER FUNCTION public.sync_products_id_seq() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: directus_access; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_access (
    id uuid NOT NULL,
    role uuid,
    "user" uuid,
    policy uuid NOT NULL,
    sort integer
);


ALTER TABLE public.directus_access OWNER TO postgres;

--
-- Name: directus_activity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_activity (
    id integer NOT NULL,
    action character varying(45) NOT NULL,
    "user" uuid,
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip character varying(50),
    user_agent text,
    collection character varying(64) NOT NULL,
    item character varying(255) NOT NULL,
    origin character varying(255)
);


ALTER TABLE public.directus_activity OWNER TO postgres;

--
-- Name: directus_activity_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.directus_activity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_activity_id_seq OWNER TO postgres;

--
-- Name: directus_activity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.directus_activity_id_seq OWNED BY public.directus_activity.id;


--
-- Name: directus_collections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_collections (
    collection character varying(64) NOT NULL,
    icon character varying(64),
    note text,
    display_template character varying(255),
    hidden boolean DEFAULT false NOT NULL,
    singleton boolean DEFAULT false NOT NULL,
    translations json,
    archive_field character varying(64),
    archive_app_filter boolean DEFAULT true NOT NULL,
    archive_value character varying(255),
    unarchive_value character varying(255),
    sort_field character varying(64),
    accountability character varying(255) DEFAULT 'all'::character varying,
    color character varying(255),
    item_duplication_fields json,
    sort integer,
    "group" character varying(64),
    collapse character varying(255) DEFAULT 'open'::character varying NOT NULL,
    preview_url character varying(255),
    versioning boolean DEFAULT false NOT NULL
);


ALTER TABLE public.directus_collections OWNER TO postgres;

--
-- Name: directus_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_comments (
    id uuid NOT NULL,
    collection character varying(64) NOT NULL,
    item character varying(255) NOT NULL,
    comment text NOT NULL,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    date_updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_created uuid,
    user_updated uuid
);


ALTER TABLE public.directus_comments OWNER TO postgres;

--
-- Name: directus_dashboards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_dashboards (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    icon character varying(64) DEFAULT 'dashboard'::character varying NOT NULL,
    note text,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_created uuid,
    color character varying(255)
);


ALTER TABLE public.directus_dashboards OWNER TO postgres;

--
-- Name: directus_extensions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_extensions (
    enabled boolean DEFAULT true NOT NULL,
    id uuid NOT NULL,
    folder character varying(255) NOT NULL,
    source character varying(255) NOT NULL,
    bundle uuid
);


ALTER TABLE public.directus_extensions OWNER TO postgres;

--
-- Name: directus_fields; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_fields (
    id integer NOT NULL,
    collection character varying(64) NOT NULL,
    field character varying(64) NOT NULL,
    special character varying(64),
    interface character varying(64),
    options json,
    display character varying(64),
    display_options json,
    readonly boolean DEFAULT false NOT NULL,
    hidden boolean DEFAULT false NOT NULL,
    sort integer,
    width character varying(30) DEFAULT 'full'::character varying,
    translations json,
    note text,
    conditions json,
    required boolean DEFAULT false,
    "group" character varying(64),
    validation json,
    validation_message text
);


ALTER TABLE public.directus_fields OWNER TO postgres;

--
-- Name: directus_fields_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.directus_fields_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_fields_id_seq OWNER TO postgres;

--
-- Name: directus_fields_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.directus_fields_id_seq OWNED BY public.directus_fields.id;


--
-- Name: directus_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_files (
    id uuid NOT NULL,
    storage character varying(255) NOT NULL,
    filename_disk character varying(255),
    filename_download character varying(255) NOT NULL,
    title character varying(255),
    type character varying(255),
    folder uuid,
    uploaded_by uuid,
    created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_by uuid,
    modified_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    charset character varying(50),
    filesize bigint,
    width integer,
    height integer,
    duration integer,
    embed character varying(200),
    description text,
    location text,
    tags text,
    metadata json,
    focal_point_x integer,
    focal_point_y integer,
    tus_id character varying(64),
    tus_data json,
    uploaded_on timestamp with time zone
);


ALTER TABLE public.directus_files OWNER TO postgres;

--
-- Name: directus_flows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_flows (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    icon character varying(64),
    color character varying(255),
    description text,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    trigger character varying(255),
    accountability character varying(255) DEFAULT 'all'::character varying,
    options json,
    operation uuid,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_created uuid
);


ALTER TABLE public.directus_flows OWNER TO postgres;

--
-- Name: directus_folders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_folders (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    parent uuid
);


ALTER TABLE public.directus_folders OWNER TO postgres;

--
-- Name: directus_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_migrations (
    version character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.directus_migrations OWNER TO postgres;

--
-- Name: directus_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_notifications (
    id integer NOT NULL,
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(255) DEFAULT 'inbox'::character varying,
    recipient uuid NOT NULL,
    sender uuid,
    subject character varying(255) NOT NULL,
    message text,
    collection character varying(64),
    item character varying(255)
);


ALTER TABLE public.directus_notifications OWNER TO postgres;

--
-- Name: directus_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.directus_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_notifications_id_seq OWNER TO postgres;

--
-- Name: directus_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.directus_notifications_id_seq OWNED BY public.directus_notifications.id;


--
-- Name: directus_operations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_operations (
    id uuid NOT NULL,
    name character varying(255),
    key character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    position_x integer NOT NULL,
    position_y integer NOT NULL,
    options json,
    resolve uuid,
    reject uuid,
    flow uuid NOT NULL,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_created uuid
);


ALTER TABLE public.directus_operations OWNER TO postgres;

--
-- Name: directus_panels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_panels (
    id uuid NOT NULL,
    dashboard uuid NOT NULL,
    name character varying(255),
    icon character varying(64) DEFAULT NULL::character varying,
    color character varying(10),
    show_header boolean DEFAULT false NOT NULL,
    note text,
    type character varying(255) NOT NULL,
    position_x integer NOT NULL,
    position_y integer NOT NULL,
    width integer NOT NULL,
    height integer NOT NULL,
    options json,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_created uuid
);


ALTER TABLE public.directus_panels OWNER TO postgres;

--
-- Name: directus_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_permissions (
    id integer NOT NULL,
    collection character varying(64) NOT NULL,
    action character varying(10) NOT NULL,
    permissions json,
    validation json,
    presets json,
    fields text,
    policy uuid NOT NULL
);


ALTER TABLE public.directus_permissions OWNER TO postgres;

--
-- Name: directus_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.directus_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_permissions_id_seq OWNER TO postgres;

--
-- Name: directus_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.directus_permissions_id_seq OWNED BY public.directus_permissions.id;


--
-- Name: directus_policies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_policies (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    icon character varying(64) DEFAULT 'badge'::character varying NOT NULL,
    description text,
    ip_access text,
    enforce_tfa boolean DEFAULT false NOT NULL,
    admin_access boolean DEFAULT false NOT NULL,
    app_access boolean DEFAULT false NOT NULL
);


ALTER TABLE public.directus_policies OWNER TO postgres;

--
-- Name: directus_presets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_presets (
    id integer NOT NULL,
    bookmark character varying(255),
    "user" uuid,
    role uuid,
    collection character varying(64),
    search character varying(100),
    layout character varying(100) DEFAULT 'tabular'::character varying,
    layout_query json,
    layout_options json,
    refresh_interval integer,
    filter json,
    icon character varying(64) DEFAULT 'bookmark'::character varying,
    color character varying(255)
);


ALTER TABLE public.directus_presets OWNER TO postgres;

--
-- Name: directus_presets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.directus_presets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_presets_id_seq OWNER TO postgres;

--
-- Name: directus_presets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.directus_presets_id_seq OWNED BY public.directus_presets.id;


--
-- Name: directus_relations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_relations (
    id integer NOT NULL,
    many_collection character varying(64) NOT NULL,
    many_field character varying(64) NOT NULL,
    one_collection character varying(64),
    one_field character varying(64),
    one_collection_field character varying(64),
    one_allowed_collections text,
    junction_field character varying(64),
    sort_field character varying(64),
    one_deselect_action character varying(255) DEFAULT 'nullify'::character varying NOT NULL
);


ALTER TABLE public.directus_relations OWNER TO postgres;

--
-- Name: directus_relations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.directus_relations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_relations_id_seq OWNER TO postgres;

--
-- Name: directus_relations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.directus_relations_id_seq OWNED BY public.directus_relations.id;


--
-- Name: directus_revisions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_revisions (
    id integer NOT NULL,
    activity integer NOT NULL,
    collection character varying(64) NOT NULL,
    item character varying(255) NOT NULL,
    data json,
    delta json,
    parent integer,
    version uuid
);


ALTER TABLE public.directus_revisions OWNER TO postgres;

--
-- Name: directus_revisions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.directus_revisions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_revisions_id_seq OWNER TO postgres;

--
-- Name: directus_revisions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.directus_revisions_id_seq OWNED BY public.directus_revisions.id;


--
-- Name: directus_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_roles (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    icon character varying(64) DEFAULT 'supervised_user_circle'::character varying NOT NULL,
    description text,
    parent uuid
);


ALTER TABLE public.directus_roles OWNER TO postgres;

--
-- Name: directus_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_sessions (
    token character varying(64) NOT NULL,
    "user" uuid,
    expires timestamp with time zone NOT NULL,
    ip character varying(255),
    user_agent text,
    share uuid,
    origin character varying(255),
    next_token character varying(64)
);


ALTER TABLE public.directus_sessions OWNER TO postgres;

--
-- Name: directus_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_settings (
    id integer NOT NULL,
    project_name character varying(100) DEFAULT 'Directus'::character varying NOT NULL,
    project_url character varying(255),
    project_color character varying(255) DEFAULT '#6644FF'::character varying NOT NULL,
    project_logo uuid,
    public_foreground uuid,
    public_background uuid,
    public_note text,
    auth_login_attempts integer DEFAULT 25,
    auth_password_policy character varying(100),
    storage_asset_transform character varying(7) DEFAULT 'all'::character varying,
    storage_asset_presets json,
    custom_css text,
    storage_default_folder uuid,
    basemaps json,
    mapbox_key character varying(255),
    module_bar json,
    project_descriptor character varying(100),
    default_language character varying(255) DEFAULT 'en-US'::character varying NOT NULL,
    custom_aspect_ratios json,
    public_favicon uuid,
    default_appearance character varying(255) DEFAULT 'auto'::character varying NOT NULL,
    default_theme_light character varying(255),
    theme_light_overrides json,
    default_theme_dark character varying(255),
    theme_dark_overrides json,
    report_error_url character varying(255),
    report_bug_url character varying(255),
    report_feature_url character varying(255),
    public_registration boolean DEFAULT false NOT NULL,
    public_registration_verify_email boolean DEFAULT true NOT NULL,
    public_registration_role uuid,
    public_registration_email_filter json,
    visual_editor_urls json
);


ALTER TABLE public.directus_settings OWNER TO postgres;

--
-- Name: directus_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.directus_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_settings_id_seq OWNER TO postgres;

--
-- Name: directus_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.directus_settings_id_seq OWNED BY public.directus_settings.id;


--
-- Name: directus_shares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_shares (
    id uuid NOT NULL,
    name character varying(255),
    collection character varying(64) NOT NULL,
    item character varying(255) NOT NULL,
    role uuid,
    password character varying(255),
    user_created uuid,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    date_start timestamp with time zone,
    date_end timestamp with time zone,
    times_used integer DEFAULT 0,
    max_uses integer
);


ALTER TABLE public.directus_shares OWNER TO postgres;

--
-- Name: directus_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_translations (
    id uuid NOT NULL,
    language character varying(255) NOT NULL,
    key character varying(255) NOT NULL,
    value text NOT NULL
);


ALTER TABLE public.directus_translations OWNER TO postgres;

--
-- Name: directus_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_users (
    id uuid NOT NULL,
    first_name character varying(50),
    last_name character varying(50),
    email character varying(128),
    password character varying(255),
    location character varying(255),
    title character varying(50),
    description text,
    tags json,
    avatar uuid,
    language character varying(255) DEFAULT NULL::character varying,
    tfa_secret character varying(255),
    status character varying(16) DEFAULT 'active'::character varying NOT NULL,
    role uuid,
    token character varying(255),
    last_access timestamp with time zone,
    last_page character varying(255),
    provider character varying(128) DEFAULT 'default'::character varying NOT NULL,
    external_identifier character varying(255),
    auth_data json,
    email_notifications boolean DEFAULT true,
    appearance character varying(255),
    theme_dark character varying(255),
    theme_light character varying(255),
    theme_light_overrides json,
    theme_dark_overrides json
);


ALTER TABLE public.directus_users OWNER TO postgres;

--
-- Name: directus_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_versions (
    id uuid NOT NULL,
    key character varying(64) NOT NULL,
    name character varying(255),
    collection character varying(64) NOT NULL,
    item character varying(255) NOT NULL,
    hash character varying(255),
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    date_updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_created uuid,
    user_updated uuid,
    delta json
);


ALTER TABLE public.directus_versions OWNER TO postgres;

--
-- Name: directus_webhooks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directus_webhooks (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    method character varying(10) DEFAULT 'POST'::character varying NOT NULL,
    url character varying(255) NOT NULL,
    status character varying(10) DEFAULT 'active'::character varying NOT NULL,
    data boolean DEFAULT true NOT NULL,
    actions character varying(100) NOT NULL,
    collections character varying(255) NOT NULL,
    headers json,
    was_active_before_deprecation boolean DEFAULT false NOT NULL,
    migrated_flow uuid
);


ALTER TABLE public.directus_webhooks OWNER TO postgres;

--
-- Name: directus_webhooks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.directus_webhooks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directus_webhooks_id_seq OWNER TO postgres;

--
-- Name: directus_webhooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.directus_webhooks_id_seq OWNED BY public.directus_webhooks.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    product_id integer NOT NULL,
    product_name text NOT NULL,
    payment_method text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    transaction_number text NOT NULL,
    order_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: product_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_options (
    id integer NOT NULL,
    product_id integer,
    price numeric(10,2),
    label text,
    description text
);


ALTER TABLE public.product_options OWNER TO postgres;

--
-- Name: product_options_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_options_id_seq OWNER TO postgres;

--
-- Name: product_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_options_id_seq OWNED BY public.product_options.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(255),
    price character varying(100),
    img character varying(255),
    description text,
    type character varying(50)
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    is_admin boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: directus_activity id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_activity ALTER COLUMN id SET DEFAULT nextval('public.directus_activity_id_seq'::regclass);


--
-- Name: directus_fields id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_fields ALTER COLUMN id SET DEFAULT nextval('public.directus_fields_id_seq'::regclass);


--
-- Name: directus_notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_notifications ALTER COLUMN id SET DEFAULT nextval('public.directus_notifications_id_seq'::regclass);


--
-- Name: directus_permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_permissions ALTER COLUMN id SET DEFAULT nextval('public.directus_permissions_id_seq'::regclass);


--
-- Name: directus_presets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_presets ALTER COLUMN id SET DEFAULT nextval('public.directus_presets_id_seq'::regclass);


--
-- Name: directus_relations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_relations ALTER COLUMN id SET DEFAULT nextval('public.directus_relations_id_seq'::regclass);


--
-- Name: directus_revisions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_revisions ALTER COLUMN id SET DEFAULT nextval('public.directus_revisions_id_seq'::regclass);


--
-- Name: directus_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_settings ALTER COLUMN id SET DEFAULT nextval('public.directus_settings_id_seq'::regclass);


--
-- Name: directus_webhooks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_webhooks ALTER COLUMN id SET DEFAULT nextval('public.directus_webhooks_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: product_options id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_options ALTER COLUMN id SET DEFAULT nextval('public.product_options_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: directus_access; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_access (id, role, "user", policy, sort) FROM stdin;
f364ef7f-3cac-4776-a4d5-8fa1e689cf8f	\N	\N	abf8a154-5b1c-4a46-ac9c-7300570f4f17	1
089ad3ac-49be-4ecd-ae16-6f9b2ea2bafa	fa566f9d-4d49-4997-a7bf-bdee1f33b30e	\N	a602b415-916c-4c2a-ad10-b109bd66ce86	\N
\.


--
-- Data for Name: directus_activity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_activity (id, action, "user", "timestamp", ip, user_agent, collection, item, origin) FROM stdin;
\.


--
-- Data for Name: directus_collections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_collections (collection, icon, note, display_template, hidden, singleton, translations, archive_field, archive_app_filter, archive_value, unarchive_value, sort_field, accountability, color, item_duplication_fields, sort, "group", collapse, preview_url, versioning) FROM stdin;
\.


--
-- Data for Name: directus_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_comments (id, collection, item, comment, date_created, date_updated, user_created, user_updated) FROM stdin;
\.


--
-- Data for Name: directus_dashboards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_dashboards (id, name, icon, note, date_created, user_created, color) FROM stdin;
\.


--
-- Data for Name: directus_extensions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_extensions (enabled, id, folder, source, bundle) FROM stdin;
\.


--
-- Data for Name: directus_fields; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_fields (id, collection, field, special, interface, options, display, display_options, readonly, hidden, sort, width, translations, note, conditions, required, "group", validation, validation_message) FROM stdin;
\.


--
-- Data for Name: directus_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_files (id, storage, filename_disk, filename_download, title, type, folder, uploaded_by, created_on, modified_by, modified_on, charset, filesize, width, height, duration, embed, description, location, tags, metadata, focal_point_x, focal_point_y, tus_id, tus_data, uploaded_on) FROM stdin;
\.


--
-- Data for Name: directus_flows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_flows (id, name, icon, color, description, status, trigger, accountability, options, operation, date_created, user_created) FROM stdin;
\.


--
-- Data for Name: directus_folders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_folders (id, name, parent) FROM stdin;
\.


--
-- Data for Name: directus_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_migrations (version, name, "timestamp") FROM stdin;
20201028A	Remove Collection Foreign Keys	2025-04-21 17:34:45.507253+01
20201029A	Remove System Relations	2025-04-21 17:34:45.518706+01
20201029B	Remove System Collections	2025-04-21 17:34:45.527174+01
20201029C	Remove System Fields	2025-04-21 17:34:45.537649+01
20201105A	Add Cascade System Relations	2025-04-21 17:34:45.75022+01
20201105B	Change Webhook URL Type	2025-04-21 17:34:45.781869+01
20210225A	Add Relations Sort Field	2025-04-21 17:34:45.794356+01
20210304A	Remove Locked Fields	2025-04-21 17:34:45.803511+01
20210312A	Webhooks Collections Text	2025-04-21 17:34:45.819259+01
20210331A	Add Refresh Interval	2025-04-21 17:34:45.82635+01
20210415A	Make Filesize Nullable	2025-04-21 17:34:45.841393+01
20210416A	Add Collections Accountability	2025-04-21 17:34:45.851229+01
20210422A	Remove Files Interface	2025-04-21 17:34:45.858425+01
20210506A	Rename Interfaces	2025-04-21 17:34:45.946835+01
20210510A	Restructure Relations	2025-04-21 17:34:45.99889+01
20210518A	Add Foreign Key Constraints	2025-04-21 17:34:46.026205+01
20210519A	Add System Fk Triggers	2025-04-21 17:34:46.086967+01
20210521A	Add Collections Icon Color	2025-04-21 17:34:46.092561+01
20210525A	Add Insights	2025-04-21 17:34:46.114714+01
20210608A	Add Deep Clone Config	2025-04-21 17:34:46.119561+01
20210626A	Change Filesize Bigint	2025-04-21 17:34:46.13715+01
20210716A	Add Conditions to Fields	2025-04-21 17:34:46.14519+01
20210721A	Add Default Folder	2025-04-21 17:34:46.156774+01
20210802A	Replace Groups	2025-04-21 17:34:46.169824+01
20210803A	Add Required to Fields	2025-04-21 17:34:46.175012+01
20210805A	Update Groups	2025-04-21 17:34:46.183806+01
20210805B	Change Image Metadata Structure	2025-04-21 17:34:46.191551+01
20210811A	Add Geometry Config	2025-04-21 17:34:46.196958+01
20210831A	Remove Limit Column	2025-04-21 17:34:46.201672+01
20210903A	Add Auth Provider	2025-04-21 17:34:46.221966+01
20210907A	Webhooks Collections Not Null	2025-04-21 17:34:46.233033+01
20210910A	Move Module Setup	2025-04-21 17:34:46.239295+01
20210920A	Webhooks URL Not Null	2025-04-21 17:34:46.253242+01
20210924A	Add Collection Organization	2025-04-21 17:34:46.260357+01
20210927A	Replace Fields Group	2025-04-21 17:34:46.274946+01
20210927B	Replace M2M Interface	2025-04-21 17:34:46.281098+01
20210929A	Rename Login Action	2025-04-21 17:34:46.286145+01
20211007A	Update Presets	2025-04-21 17:34:46.296364+01
20211009A	Add Auth Data	2025-04-21 17:34:46.301445+01
20211016A	Add Webhook Headers	2025-04-21 17:34:46.305671+01
20211103A	Set Unique to User Token	2025-04-21 17:34:46.310929+01
20211103B	Update Special Geometry	2025-04-21 17:34:46.316134+01
20211104A	Remove Collections Listing	2025-04-21 17:34:46.320147+01
20211118A	Add Notifications	2025-04-21 17:34:46.334276+01
20211211A	Add Shares	2025-04-21 17:34:46.353501+01
20211230A	Add Project Descriptor	2025-04-21 17:34:46.358141+01
20220303A	Remove Default Project Color	2025-04-21 17:34:46.370299+01
20220308A	Add Bookmark Icon and Color	2025-04-21 17:34:46.375018+01
20220314A	Add Translation Strings	2025-04-21 17:34:46.379623+01
20220322A	Rename Field Typecast Flags	2025-04-21 17:34:46.387586+01
20220323A	Add Field Validation	2025-04-21 17:34:46.392847+01
20220325A	Fix Typecast Flags	2025-04-21 17:34:46.399213+01
20220325B	Add Default Language	2025-04-21 17:34:46.411+01
20220402A	Remove Default Value Panel Icon	2025-04-21 17:34:46.421025+01
20220429A	Add Flows	2025-04-21 17:34:46.471822+01
20220429B	Add Color to Insights Icon	2025-04-21 17:34:46.477552+01
20220429C	Drop Non Null From IP of Activity	2025-04-21 17:34:46.484451+01
20220429D	Drop Non Null From Sender of Notifications	2025-04-21 17:34:46.490255+01
20220614A	Rename Hook Trigger to Event	2025-04-21 17:34:46.495992+01
20220801A	Update Notifications Timestamp Column	2025-04-21 17:34:46.510022+01
20220802A	Add Custom Aspect Ratios	2025-04-21 17:34:46.516329+01
20220826A	Add Origin to Accountability	2025-04-21 17:34:46.525795+01
20230401A	Update Material Icons	2025-04-21 17:34:46.544658+01
20230525A	Add Preview Settings	2025-04-21 17:34:46.552128+01
20230526A	Migrate Translation Strings	2025-04-21 17:34:46.571645+01
20230721A	Require Shares Fields	2025-04-21 17:34:46.585778+01
20230823A	Add Content Versioning	2025-04-21 17:34:46.618621+01
20230927A	Themes	2025-04-21 17:34:46.647569+01
20231009A	Update CSV Fields to Text	2025-04-21 17:34:46.656828+01
20231009B	Update Panel Options	2025-04-21 17:34:46.662118+01
20231010A	Add Extensions	2025-04-21 17:34:46.668831+01
20231215A	Add Focalpoints	2025-04-21 17:34:46.674486+01
20240122A	Add Report URL Fields	2025-04-21 17:34:46.679916+01
20240204A	Marketplace	2025-04-21 17:34:46.73021+01
20240305A	Change Useragent Type	2025-04-21 17:34:46.754627+01
20240311A	Deprecate Webhooks	2025-04-21 17:34:46.772582+01
20240422A	Public Registration	2025-04-21 17:34:46.780033+01
20240515A	Add Session Window	2025-04-21 17:34:46.785352+01
20240701A	Add Tus Data	2025-04-21 17:34:46.790139+01
20240716A	Update Files Date Fields	2025-04-21 17:34:46.80267+01
20240806A	Permissions Policies	2025-04-21 17:34:46.858111+01
20240817A	Update Icon Fields Length	2025-04-21 17:34:46.903864+01
20240909A	Separate Comments	2025-04-21 17:34:46.926496+01
20240909B	Consolidate Content Versioning	2025-04-21 17:34:46.933832+01
20240924A	Migrate Legacy Comments	2025-04-21 17:34:46.949056+01
20240924B	Populate Versioning Deltas	2025-04-21 17:34:46.956139+01
20250224A	Visual Editor	2025-04-21 17:34:46.962704+01
\.


--
-- Data for Name: directus_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_notifications (id, "timestamp", status, recipient, sender, subject, message, collection, item) FROM stdin;
\.


--
-- Data for Name: directus_operations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_operations (id, name, key, type, position_x, position_y, options, resolve, reject, flow, date_created, user_created) FROM stdin;
\.


--
-- Data for Name: directus_panels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_panels (id, dashboard, name, icon, color, show_header, note, type, position_x, position_y, width, height, options, date_created, user_created) FROM stdin;
\.


--
-- Data for Name: directus_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_permissions (id, collection, action, permissions, validation, presets, fields, policy) FROM stdin;
\.


--
-- Data for Name: directus_policies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_policies (id, name, icon, description, ip_access, enforce_tfa, admin_access, app_access) FROM stdin;
abf8a154-5b1c-4a46-ac9c-7300570f4f17	$t:public_label	public	$t:public_description	\N	f	f	f
a602b415-916c-4c2a-ad10-b109bd66ce86	Administrator	verified	$t:admin_description	\N	f	t	t
\.


--
-- Data for Name: directus_presets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_presets (id, bookmark, "user", role, collection, search, layout, layout_query, layout_options, refresh_interval, filter, icon, color) FROM stdin;
\.


--
-- Data for Name: directus_relations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_relations (id, many_collection, many_field, one_collection, one_field, one_collection_field, one_allowed_collections, junction_field, sort_field, one_deselect_action) FROM stdin;
\.


--
-- Data for Name: directus_revisions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_revisions (id, activity, collection, item, data, delta, parent, version) FROM stdin;
\.


--
-- Data for Name: directus_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_roles (id, name, icon, description, parent) FROM stdin;
fa566f9d-4d49-4997-a7bf-bdee1f33b30e	Administrator	verified	$t:admin_description	\N
\.


--
-- Data for Name: directus_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_sessions (token, "user", expires, ip, user_agent, share, origin, next_token) FROM stdin;
\.


--
-- Data for Name: directus_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_settings (id, project_name, project_url, project_color, project_logo, public_foreground, public_background, public_note, auth_login_attempts, auth_password_policy, storage_asset_transform, storage_asset_presets, custom_css, storage_default_folder, basemaps, mapbox_key, module_bar, project_descriptor, default_language, custom_aspect_ratios, public_favicon, default_appearance, default_theme_light, theme_light_overrides, default_theme_dark, theme_dark_overrides, report_error_url, report_bug_url, report_feature_url, public_registration, public_registration_verify_email, public_registration_role, public_registration_email_filter, visual_editor_urls) FROM stdin;
\.


--
-- Data for Name: directus_shares; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_shares (id, name, collection, item, role, password, user_created, date_created, date_start, date_end, times_used, max_uses) FROM stdin;
\.


--
-- Data for Name: directus_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_translations (id, language, key, value) FROM stdin;
\.


--
-- Data for Name: directus_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_users (id, first_name, last_name, email, password, location, title, description, tags, avatar, language, tfa_secret, status, role, token, last_access, last_page, provider, external_identifier, auth_data, email_notifications, appearance, theme_dark, theme_light, theme_light_overrides, theme_dark_overrides) FROM stdin;
ba6ef2ec-688f-4d13-bae5-8446dd1cfbb2	Admin	User	admin@example.com	$argon2id$v=19$m=65536,t=3,p=4$AYSrxhk3bUx5jACRQxBquQ$VX8l3ooIlNf4hO34vurPcZoAE3OB5bI8PUqIVK41eu4	\N	\N	\N	\N	\N	\N	\N	active	fa566f9d-4d49-4997-a7bf-bdee1f33b30e	\N	\N	\N	default	\N	\N	t	\N	\N	\N	\N	\N
\.


--
-- Data for Name: directus_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_versions (id, key, name, collection, item, hash, date_created, date_updated, user_created, user_updated, delta) FROM stdin;
\.


--
-- Data for Name: directus_webhooks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directus_webhooks (id, name, method, url, status, data, actions, collections, headers, was_active_before_deprecation, migrated_flow) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, product_id, product_name, payment_method, email, phone, transaction_number, order_time, user_id) FROM stdin;
\.


--
-- Data for Name: product_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_options (id, product_id, price, label, description) FROM stdin;
11	17	14.46	Option 1	Steam Wallet credit pack 1
12	17	57.85	Option 2	Steam Wallet credit pack 2
13	17	115.70	Option 3	Steam Wallet credit pack 3
14	17	173.55	Option 4	Steam Wallet credit pack 4
15	17	289.25	Option 5	Steam Wallet credit pack 5
16	46	14.00	Option 1	Xbox Gift Card pack 1
17	46	57.00	Option 2	Xbox Gift Card pack 2
18	46	115.00	Option 3	Xbox Gift Card pack 3
19	46	173.00	Option 4	Xbox Gift Card pack 4
20	46	289.25	Option 5	Xbox Gift Card pack 5
21	10	14.46	Option 1	ChatGPT Pro 1 month access
22	10	28.92	Option 2	ChatGPT Pro 3 months access
23	10	57.84	Option 3	ChatGPT Pro 6 months access
24	10	86.76	Option 4	ChatGPT Pro 9 months access
25	10	144.63	Option 5	ChatGPT Pro 12 months access
26	30	14.46	Option 1	Discord Nitro 1 month
27	30	28.92	Option 2	Discord Nitro 3 months
28	30	43.38	Option 3	Discord Nitro 6 months
29	30	57.84	Option 4	Discord Nitro 9 months
30	30	86.78	Option 5	Discord Nitro 12 months
31	7	14.46	Option 1	Netflix Basic Plan
32	7	28.92	Option 2	Netflix Standard Plan
33	7	43.38	Option 3	Netflix Premium Plan
34	7	57.84	Option 4	Netflix Family Plan
35	7	86.76	Option 5	Netflix Ultra HD Plan
36	23	14.46	Option 1	Amazon Prime Video 1 month
37	23	28.92	Option 2	Amazon Prime Video 3 months
38	23	43.38	Option 3	Amazon Prime Video 6 months
39	23	57.84	Option 4	Amazon Prime Video 9 months
40	23	86.76	Option 5	Amazon Prime Video 12 months
41	20	5.00	Option 1	Tinder Boost 1 day
42	20	20.00	Option 2	Tinder Boost 1 week
43	20	50.00	Option 3	Tinder Gold 1 month
44	20	75.00	Option 4	Tinder Gold 3 months
45	20	100.00	Option 5	Tinder Gold 6 months
46	12	14.46	Option 1	YouTube Music 1 month premium
47	12	28.92	Option 2	YouTube Music 3 months premium
48	12	43.38	Option 3	YouTube Music 6 months premium
49	12	57.84	Option 4	YouTube Music 9 months premium
50	12	144.63	Option 5	YouTube Music 12 months premium
51	21	14.46	Option 1	Shahid VIP 1 month access
52	21	28.92	Option 2	Shahid VIP 3 months access
53	21	43.38	Option 3	Shahid VIP 6 months access
54	21	57.84	Option 4	Shahid VIP 9 months access
55	21	144.63	Option 5	Shahid VIP 12 months access
56	22	14.46	Option 1	Adobe CC Monthly Subscription
57	22	28.92	Option 2	Adobe CC Quarterly Subscription
58	22	57.84	Option 3	Adobe CC Semi-Annual Subscription
59	22	86.76	Option 4	Adobe CC Nine Months Subscription
60	22	289.25	Option 5	Adobe CC Annual Subscription
61	14	14.46	Option 1	iTunes credit pack 1
62	14	28.92	Option 2	iTunes credit pack 2
63	14	43.38	Option 3	iTunes credit pack 3
64	14	57.84	Option 4	iTunes credit pack 4
65	14	144.63	Option 5	iTunes credit pack 5
66	13	14.46	Option 1	PSN Wallet credit pack 1
67	13	28.92	Option 2	PSN Wallet credit pack 2
68	13	43.38	Option 3	PSN Wallet credit pack 3
69	13	57.84	Option 4	PSN Wallet credit pack 4
70	13	144.63	Option 5	PSN Wallet credit pack 5
71	31	14.00	Option 1	LinkedIn Premium 1 month
72	31	28.00	Option 2	LinkedIn Premium 3 months
73	31	42.00	Option 3	LinkedIn Premium 6 months
74	31	56.00	Option 4	LinkedIn Premium 9 months
75	31	100.00	Option 5	LinkedIn Premium 12 months
76	32	30.00	Option 1	Autodesk subscription 1 month
77	32	90.00	Option 2	Autodesk subscription 3 months
78	32	180.00	Option 3	Autodesk subscription 6 months
79	32	270.00	Option 4	Autodesk subscription 9 months
80	32	300.00	Option 5	Autodesk subscription 12 months
81	33	14.00	Option 1	Crunchyroll Premium 1 month
82	33	28.00	Option 2	Crunchyroll Premium 3 months
83	33	42.00	Option 3	Crunchyroll Premium 6 months
84	33	56.00	Option 4	Crunchyroll Premium 9 months
85	33	100.00	Option 5	Crunchyroll Premium 12 months
86	35	14.00	Option 1	Gemini Advanced 1 month
87	35	28.00	Option 2	Gemini Advanced 3 months
88	35	42.00	Option 3	Gemini Advanced 6 months
89	35	56.00	Option 4	Gemini Advanced 9 months
90	35	100.00	Option 5	Gemini Advanced 12 months
91	36	14.00	Option 1	Starz Play subscription 1 month
92	36	28.00	Option 2	Starz Play subscription 3 months
93	36	42.00	Option 3	Starz Play subscription 6 months
94	36	56.00	Option 4	Starz Play subscription 9 months
95	36	100.00	Option 5	Starz Play subscription 12 months
96	37	14.00	Option 1	Artify subscription 1 month
97	37	28.00	Option 2	Artify subscription 3 months
98	37	42.00	Option 3	Artify subscription 6 months
99	37	56.00	Option 4	Artify subscription 9 months
100	37	100.00	Option 5	Artify subscription 12 months
6	19	14.46	1 mois	Xbox Wallet credit pack 1
8	19	115.70	Option 3	Xbox Wallet credit pack 3
5	11	144.63	12 mois 	Canva Pro access for 12 months
4	11	86.76	4 mois 	Canva Pro access for 9 months
7	19	57.85	Option 2	Xbox Wallet credit pack 2
10	19	289.25	Option 5	Xbox Wallet credit pack 5
9	19	173.55	Option 4	Xbox Wallet credit pack 4
2	11	28.92	2 mois	Canva Pro access for 3 months
101	38	14.00	Option 1	Perplexity Pro 1 month
102	38	28.00	Option 2	Perplexity Pro 3 months
103	38	42.00	Option 3	Perplexity Pro 6 months
104	38	56.00	Option 4	Perplexity Pro 9 months
105	38	100.00	Option 5	Perplexity Pro 12 months
106	39	14.00	Option 1	Surfshark VPN 1 month
107	39	28.00	Option 2	Surfshark VPN 3 months
108	39	42.00	Option 3	Surfshark VPN 6 months
109	39	56.00	Option 4	Surfshark VPN 9 months
110	39	100.00	Option 5	Surfshark VPN 12 months
111	40	14.00	Option 1	Watch It subscription 1 month
112	40	28.00	Option 2	Watch It subscription 3 months
113	40	42.00	Option 3	Watch It subscription 6 months
114	40	56.00	Option 4	Watch It subscription 9 months
115	40	100.00	Option 5	Watch It subscription 12 months
116	42	14.00	Option 1	OSN+ subscription 1 month
117	42	28.00	Option 2	OSN+ subscription 3 months
118	42	42.00	Option 3	OSN+ subscription 6 months
119	42	56.00	Option 4	OSN+ subscription 9 months
120	42	100.00	Option 5	OSN+ subscription 12 months
121	43	14.00	Option 1	TOD subscription 1 month
122	43	28.00	Option 2	TOD subscription 3 months
123	43	42.00	Option 3	TOD subscription 6 months
124	43	56.00	Option 4	TOD subscription 9 months
125	43	100.00	Option 5	TOD subscription 12 months
126	44	14.00	Option 1	Truecaller Premium 1 month
127	44	28.00	Option 2	Truecaller Premium 3 months
128	44	42.00	Option 3	Truecaller Premium 6 months
129	44	56.00	Option 4	Truecaller Premium 9 months
130	44	100.00	Option 5	Truecaller Premium 12 months
131	45	14.00	Option 1	IPTV Strong 8K 1 month
132	45	28.00	Option 2	IPTV Strong 8K 3 months
133	45	42.00	Option 3	IPTV Strong 8K 6 months
134	45	56.00	Option 4	IPTV Strong 8K 9 months
135	45	100.00	Option 5	IPTV Strong 8K 12 months
136	9	14.46	Option 1	CapCut Pro 1 month subscription
137	9	28.92	Option 2	CapCut Pro 3 months subscription
138	9	43.38	Option 3	CapCut Pro 6 months subscription
139	9	57.84	Option 4	CapCut Pro 9 months subscription
140	9	144.63	Option 5	CapCut Pro 12 months subscription
141	34	14.00	Option 1	Apple TV+ 1 month subscription
142	34	28.00	Option 2	Apple TV+ 3 months subscription
143	34	42.00	Option 3	Apple TV+ 6 months subscription
144	34	56.00	Option 4	Apple TV+ 9 months subscription
145	34	100.00	Option 5	Apple TV+ 12 months subscription
146	47	25.00	Steam Key	Digital Steam key for FC 25
147	47	27.00	Xbox Key	Digital Xbox key for FC 25
148	47	30.00	PS5 Key	Digital PS5 key for FC 25
149	47	28.00	PS4 Key	Digital PS4 key for FC 25
150	47	26.00	Nintendo Key	Digital Nintendo key for FC 25
151	48	30.00	Steam Key	Digital Steam key for GTA V
152	48	32.00	Xbox Key	Digital Xbox key for GTA V
153	48	35.00	PS5 Key	Digital PS5 key for GTA V
154	48	33.00	PS4 Key	Digital PS4 key for GTA V
155	48	31.00	Nintendo Key	Digital Nintendo key for GTA V
156	49	40.00	Steam Key	Digital Steam key for Assassins Creed Valhalla
157	49	42.00	Xbox Key	Digital Xbox key for Assassins Creed Valhalla
158	49	45.00	PS5 Key	Digital PS5 key for Assassins Creed Valhalla
159	49	43.00	PS4 Key	Digital PS4 key for Assassins Creed Valhalla
160	49	41.00	Nintendo Key	Digital Nintendo key for Assassins Creed Valhalla
161	50	35.00	Steam Key	Digital Steam key for Red Dead Redemption II
162	50	37.00	Xbox Key	Digital Xbox key for Red Dead Redemption II
163	50	40.00	PS5 Key	Digital PS5 key for Red Dead Redemption II
164	50	38.00	PS4 Key	Digital PS4 key for Red Dead Redemption II
165	50	36.00	Nintendo Key	Digital Nintendo key for Red Dead Redemption II
166	51	45.00	Steam Key	Digital Steam key for Black Myth Wukong
167	51	47.00	Xbox Key	Digital Xbox key for Black Myth Wukong
168	51	50.00	PS5 Key	Digital PS5 key for Black Myth Wukong
169	51	48.00	PS4 Key	Digital PS4 key for Black Myth Wukong
170	51	46.00	Nintendo Key	Digital Nintendo key for Black Myth Wukong
171	52	40.00	Steam Key	Digital Steam key for The Last of Us Part II
172	52	42.00	Xbox Key	Digital Xbox key for The Last of Us Part II
173	52	45.00	PS5 Key	Digital PS5 key for The Last of Us Part II
174	52	43.00	PS4 Key	Digital PS4 key for The Last of Us Part II
175	52	41.00	Nintendo Key	Digital Nintendo key for The Last of Us Part II
176	53	30.00	Steam Key	Digital Steam key for Spider-Man Remastered
177	53	32.00	Xbox Key	Digital Xbox key for Spider-Man Remastered
178	53	35.00	PS5 Key	Digital PS5 key for Spider-Man Remastered
179	53	33.00	PS4 Key	Digital PS4 key for Spider-Man Remastered
180	53	31.00	Nintendo Key	Digital Nintendo key for Spider-Man Remastered
181	54	40.00	Steam Key	Digital Steam key for Call of Duty MW3
182	54	42.00	Xbox Key	Digital Xbox key for Call of Duty MW3
183	54	45.00	PS5 Key	Digital PS5 key for Call of Duty MW3
184	54	43.00	PS4 Key	Digital PS4 key for Call of Duty MW3
185	54	41.00	Nintendo Key	Digital Nintendo key for Call of Duty MW3
186	55	35.00	Steam Key	Digital Steam key for Far Cry 6
187	55	37.00	Xbox Key	Digital Xbox key for Far Cry 6
188	55	40.00	PS5 Key	Digital PS5 key for Far Cry 6
189	55	38.00	PS4 Key	Digital PS4 key for Far Cry 6
190	55	36.00	Nintendo Key	Digital Nintendo key for Far Cry 6
191	56	30.00	Steam Key	Digital Steam key for Minecraft
3	11	57.84	3 mois 	Canva Pro access for 6 months
192	56	32.00	Xbox Key	Digital Xbox key for Minecraft
193	56	35.00	PS5 Key	Digital PS5 key for Minecraft
194	56	33.00	PS4 Key	Digital PS4 key for Minecraft
195	56	31.00	Nintendo Key	Digital Nintendo key for Minecraft
1	11	14.46	1 mois	Canva Pro access for 1 month
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, price, img, description, type) FROM stdin;
19	Xbox Wallet	DT14.46 - DT289.25	1751315758919.jpg	Get Xbox gift cards for games, DLC, subscriptions, and more.	games
11	Canva Pro	DT14.46 - DT1450	1751315485633.jpg	Access premium templates, tools, and features with Canva Pro gift cards.	gift_cards
17	Steam wallet	DT14.46 - DT289.25	1751315428011.jpg	Redeem Steam gift cards for games, software, and content.	games
46	Xbox Gift Card	DT14.00 - DT289.25	/images/16.jpg	Get Xbox gift cards for games, DLC, subscriptions, and more.	games
10	Chat Gpt	DT14.46 - DT144.63	1751315770139.jpg	Use credits for ChatGPT Pro access and faster AI generation.	gift_cards
30	Discord	DT14.46 - DT86.78	1751315904508.jpg	Get Discord Nitro perks like boosts, emojis, and HD streaming.	gift_cards
7	Netflix	DT14.46 - DT144.63	1751315313519.jpg	Stream your favorite shows and movies with Netflix gift cards.	gift_cards
23	Prime Video	DT14.46 - DT289.25	1751315398009.jpg	Watch movies, TV shows, and originals with Amazon Prime Video gift cards.	gift_cards
20	Tinder	DT5.00 - DT100.00	1751315511166.jpg	Boost your profile or get Tinder Gold with prepaid gift cards.	gift_cards
12	Youtube Music	DT14.46 - DT144.63	1751315553022.jpg	Listen to ad-free music with YouTube Music Premium cards.	gift_cards
21	Shahid Vip	DT14.46 - DT289.25	1751315572706.jpg	Watch Arabic and international shows with Shahid VIP gift cards.	gift_cards
22	Adobe Creative Cloud	DT14.46 - DT289.25	1751315613060.jpg	Subscribe to Photoshop, Illustrator, and more with Adobe Creative Cloud gift cards.	gift_cards
14	iTunes	DT14.46 - DT144.63	1751315692543.jpg	Buy music, apps, and media from the Apple Store with iTunes gift cards.	gift_cards
13	Psn Wallet	DT14.46 - DT144.63	1751315744139.jpg	Get games and add-ons for your PlayStation console with PSN Wallet cards.	gift_cards
31	LinkedIn Premium	DT14.00 - DT100.00	/images/1.jpg	Upgrade your career with advanced insights, InMail credits, and learning tools from LinkedIn Premium.	gift_cards
32	Autodesk	DT30.00 - DT300.00	/images/2.jpg	Access professional tools like AutoCAD and Revit for 3D design and engineering with Autodesk subscriptions.	gift_cards
33	Crunchyroll	DT14.00 - DT100.00	/images/3.jpg	Stream the latest anime episodes, movies, and simulcasts ad-free with Crunchyroll Premium.	gift_cards
35	Gemini Advanced	DT14.00 - DT100.00	/images/5.jpg	Get access to Google Gemini Advanced for powerful AI features and expanded assistant capabilities.	gift_cards
36	Starz Play	DT14.00 - DT100.00	/images/6.jpg	Enjoy Hollywood movies, series, and Arabic originals with a Starz Play subscription.	gift_cards
37	Artify	DT14.00 - DT100.00	/images/7.jpg	Stream Tunisian and Arab entertainment content, movies, and shows with Artify.	gift_cards
38	Perplexity Pro	DT14.00 - DT100.00	/images/8.jpg	Upgrade to Perplexity Pro for faster, more accurate AI answers with web access and history.	gift_cards
39	Surfshark VPN	DT14.00 - DT100.00	/images/9.jpg	Secure your online privacy, unblock content, and protect multiple devices with Surfshark VPN.	gift_cards
40	Watch It	DT14.00 - DT100.00	/images/10.jpg	Stream exclusive Egyptian and Arabic series, films, and shows with Watch It subscription.	gift_cards
42	OSN+	DT14.00 - DT100.00	/images/12.jpg	Stream HBO, Paramount+, and exclusive Arabic content with OSN+.	gift_cards
43	TOD	DT14.00 - DT100.00	/images/13.jpg	Watch live sports, movies, and series including beIN content with TOD subscriptions.	gift_cards
44	Truecaller Premium	DT14.00 - DT100.00	/images/14.jpg	Identify unknown callers, block spam, and use advanced features with Truecaller Premium.	gift_cards
45	IPTV Strong 8K	DT14.00 - DT100.00	/images/15.jpg	Watch global TV channels, movies, and sports in ultra HD with IPTV Strong 8K service.	gift_cards
9	CapCut Pro	DT14.46 - DT144.63	1751315462830.jpg	Unlock advanced video editing features with CapCut Pro for high-quality, watermark-free exports.	gift_cards
34	Apple TV+	DT14.00 - DT100.00	1751376048608.jpg	Watch award-winning Apple Originals, series, and films with an Apple TV+ subscription.	gift_cards
47	FC 25	$25	11.jpg	Exciting football simulation game.	games
48	GTA V	$30	22.jpg	Open-world action-adventure game.	games
49	Assassin s Creed Valhalla	$40	33.jpg	Epic Viking saga in an open world.	games
50	RED DEAD REDEMPTION II	$50	44.jpg	Western-themed action-adventure game.	games
51	BLACK MYTH WUKONG	$45	55.jpg	Mythical action RPG based on Chinese folklore.	games
52	THE LAST OF US PART II	$35	66.jpg	Emotional post-apocalyptic survival game.	games
53	SPIDER-MAN REMASTRED	$28	77.jpg	Action-packed superhero adventure.	games
54	CALL OF DUTY MODERN WARFARE III	$60	88.jpg	First-person shooter with intense missions.	games
55	FARCRY 6	$40	99.jpg	Open-world FPS set in a tropical paradise.	games
56	MINECRAFT	$20	100.jpg	Creative sandbox game with endless possibilities.	games
41	Disney+	DT14.00 - DT100.00	1751411249784.jpg	Access Disney, Marvel, Star Wars, Pixar, and National Geographic content with Disney+.	gift_cards
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, is_admin) FROM stdin;
2	zef	az@gmail.com	$2b$10$8EE2c4WnaRf0OstCC1AbpOAuCT7Aov3hpfyN/K5GQMgBhOYln2Qyq	f
3	test	test@test.com	$2b$10$raBWcbwcv/CY51bV3p3iNuWLOfYsY8kmyh91IY4zSDSw95iPZ5hfi	f
1	admin	admin@admin.com	$2a$12$xRZYWQvxsRJoI0N3BMFm9.2gE8r3zaOIycZedajE5remdzwLSqau.	t
4	Guest	guest@yourstore.com	a_hashed_password	f
5	Customer	1@1.1	$2b$10$h/eRnHQOu52b8x3jYzUQD.LuIGPSMrhCHiwUTXSCtqBItRILCfJsi	f
6	Customer	aminhayouni2003@gmail.com	$2b$10$F7aRgEC0eR7WCXuurFGHvOIHMdFlRpodiacuJjituCIPUGvwk1aT2	f
7	Customer	hayouniamine11@gmail.com	$2b$10$v/h6NtHzX1qc.qV1oainReP7TJbLh0d.R2kcQ2xnlOYi7T0P.0U0.	f
8	Customer	zsccz@1.1	$2b$10$jHkGJNADEDOygz6us7SJXObZkGPlIAv9iN7rQPtueCqFzpYDDZlEu	f
9	Customer	jeridi@gmail.com	$2b$10$1mJ4wg2egZ0lw5WzCf0DJOBD8BgHZSKlS3821q5sjWe9TFDgnwNzS	f
10	Customer	azert@gmail.com	$2b$10$owVzunrogqCwkb6ckU1gaeeyls3VcqtOFG9C7yRr2gSMFjykiJylS	f
11	Customer	uyfhuyv@1.com	$2b$10$3NhGIorimtEaa/.rFAYMVOwXLOjQiaXlYyJgu.aDu0YIOfmZQzsJ.	f
\.


--
-- Name: directus_activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.directus_activity_id_seq', 1, false);


--
-- Name: directus_fields_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.directus_fields_id_seq', 1, false);


--
-- Name: directus_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.directus_notifications_id_seq', 1, false);


--
-- Name: directus_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.directus_permissions_id_seq', 1, false);


--
-- Name: directus_presets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.directus_presets_id_seq', 1, false);


--
-- Name: directus_relations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.directus_relations_id_seq', 1, false);


--
-- Name: directus_revisions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.directus_revisions_id_seq', 1, false);


--
-- Name: directus_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.directus_settings_id_seq', 1, false);


--
-- Name: directus_webhooks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.directus_webhooks_id_seq', 1, false);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 68, true);


--
-- Name: product_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_options_id_seq', 195, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 56, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 11, true);


--
-- Name: directus_access directus_access_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_access
    ADD CONSTRAINT directus_access_pkey PRIMARY KEY (id);


--
-- Name: directus_activity directus_activity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_activity
    ADD CONSTRAINT directus_activity_pkey PRIMARY KEY (id);


--
-- Name: directus_collections directus_collections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_collections
    ADD CONSTRAINT directus_collections_pkey PRIMARY KEY (collection);


--
-- Name: directus_comments directus_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_comments
    ADD CONSTRAINT directus_comments_pkey PRIMARY KEY (id);


--
-- Name: directus_dashboards directus_dashboards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_dashboards
    ADD CONSTRAINT directus_dashboards_pkey PRIMARY KEY (id);


--
-- Name: directus_extensions directus_extensions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_extensions
    ADD CONSTRAINT directus_extensions_pkey PRIMARY KEY (id);


--
-- Name: directus_fields directus_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_fields
    ADD CONSTRAINT directus_fields_pkey PRIMARY KEY (id);


--
-- Name: directus_files directus_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_files
    ADD CONSTRAINT directus_files_pkey PRIMARY KEY (id);


--
-- Name: directus_flows directus_flows_operation_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_flows
    ADD CONSTRAINT directus_flows_operation_unique UNIQUE (operation);


--
-- Name: directus_flows directus_flows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_flows
    ADD CONSTRAINT directus_flows_pkey PRIMARY KEY (id);


--
-- Name: directus_folders directus_folders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_folders
    ADD CONSTRAINT directus_folders_pkey PRIMARY KEY (id);


--
-- Name: directus_migrations directus_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_migrations
    ADD CONSTRAINT directus_migrations_pkey PRIMARY KEY (version);


--
-- Name: directus_notifications directus_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_notifications
    ADD CONSTRAINT directus_notifications_pkey PRIMARY KEY (id);


--
-- Name: directus_operations directus_operations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_pkey PRIMARY KEY (id);


--
-- Name: directus_operations directus_operations_reject_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_reject_unique UNIQUE (reject);


--
-- Name: directus_operations directus_operations_resolve_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_resolve_unique UNIQUE (resolve);


--
-- Name: directus_panels directus_panels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_panels
    ADD CONSTRAINT directus_panels_pkey PRIMARY KEY (id);


--
-- Name: directus_permissions directus_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_permissions
    ADD CONSTRAINT directus_permissions_pkey PRIMARY KEY (id);


--
-- Name: directus_policies directus_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_policies
    ADD CONSTRAINT directus_policies_pkey PRIMARY KEY (id);


--
-- Name: directus_presets directus_presets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_presets
    ADD CONSTRAINT directus_presets_pkey PRIMARY KEY (id);


--
-- Name: directus_relations directus_relations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_relations
    ADD CONSTRAINT directus_relations_pkey PRIMARY KEY (id);


--
-- Name: directus_revisions directus_revisions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_revisions
    ADD CONSTRAINT directus_revisions_pkey PRIMARY KEY (id);


--
-- Name: directus_roles directus_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_roles
    ADD CONSTRAINT directus_roles_pkey PRIMARY KEY (id);


--
-- Name: directus_sessions directus_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_sessions
    ADD CONSTRAINT directus_sessions_pkey PRIMARY KEY (token);


--
-- Name: directus_settings directus_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_settings
    ADD CONSTRAINT directus_settings_pkey PRIMARY KEY (id);


--
-- Name: directus_shares directus_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_shares
    ADD CONSTRAINT directus_shares_pkey PRIMARY KEY (id);


--
-- Name: directus_translations directus_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_translations
    ADD CONSTRAINT directus_translations_pkey PRIMARY KEY (id);


--
-- Name: directus_users directus_users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_users
    ADD CONSTRAINT directus_users_email_unique UNIQUE (email);


--
-- Name: directus_users directus_users_external_identifier_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_users
    ADD CONSTRAINT directus_users_external_identifier_unique UNIQUE (external_identifier);


--
-- Name: directus_users directus_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_users
    ADD CONSTRAINT directus_users_pkey PRIMARY KEY (id);


--
-- Name: directus_users directus_users_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_users
    ADD CONSTRAINT directus_users_token_unique UNIQUE (token);


--
-- Name: directus_versions directus_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_versions
    ADD CONSTRAINT directus_versions_pkey PRIMARY KEY (id);


--
-- Name: directus_webhooks directus_webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_webhooks
    ADD CONSTRAINT directus_webhooks_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: product_options product_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_options
    ADD CONSTRAINT product_options_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: products trg_sync_products_seq; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_sync_products_seq AFTER INSERT ON public.products FOR EACH STATEMENT EXECUTE FUNCTION public.sync_products_id_seq();


--
-- Name: directus_access directus_access_policy_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_access
    ADD CONSTRAINT directus_access_policy_foreign FOREIGN KEY (policy) REFERENCES public.directus_policies(id) ON DELETE CASCADE;


--
-- Name: directus_access directus_access_role_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_access
    ADD CONSTRAINT directus_access_role_foreign FOREIGN KEY (role) REFERENCES public.directus_roles(id) ON DELETE CASCADE;


--
-- Name: directus_access directus_access_user_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_access
    ADD CONSTRAINT directus_access_user_foreign FOREIGN KEY ("user") REFERENCES public.directus_users(id) ON DELETE CASCADE;


--
-- Name: directus_collections directus_collections_group_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_collections
    ADD CONSTRAINT directus_collections_group_foreign FOREIGN KEY ("group") REFERENCES public.directus_collections(collection);


--
-- Name: directus_comments directus_comments_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_comments
    ADD CONSTRAINT directus_comments_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_comments directus_comments_user_updated_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_comments
    ADD CONSTRAINT directus_comments_user_updated_foreign FOREIGN KEY (user_updated) REFERENCES public.directus_users(id);


--
-- Name: directus_dashboards directus_dashboards_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_dashboards
    ADD CONSTRAINT directus_dashboards_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_files directus_files_folder_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_files
    ADD CONSTRAINT directus_files_folder_foreign FOREIGN KEY (folder) REFERENCES public.directus_folders(id) ON DELETE SET NULL;


--
-- Name: directus_files directus_files_modified_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_files
    ADD CONSTRAINT directus_files_modified_by_foreign FOREIGN KEY (modified_by) REFERENCES public.directus_users(id);


--
-- Name: directus_files directus_files_uploaded_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_files
    ADD CONSTRAINT directus_files_uploaded_by_foreign FOREIGN KEY (uploaded_by) REFERENCES public.directus_users(id);


--
-- Name: directus_flows directus_flows_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_flows
    ADD CONSTRAINT directus_flows_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_folders directus_folders_parent_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_folders
    ADD CONSTRAINT directus_folders_parent_foreign FOREIGN KEY (parent) REFERENCES public.directus_folders(id);


--
-- Name: directus_notifications directus_notifications_recipient_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_notifications
    ADD CONSTRAINT directus_notifications_recipient_foreign FOREIGN KEY (recipient) REFERENCES public.directus_users(id) ON DELETE CASCADE;


--
-- Name: directus_notifications directus_notifications_sender_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_notifications
    ADD CONSTRAINT directus_notifications_sender_foreign FOREIGN KEY (sender) REFERENCES public.directus_users(id);


--
-- Name: directus_operations directus_operations_flow_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_flow_foreign FOREIGN KEY (flow) REFERENCES public.directus_flows(id) ON DELETE CASCADE;


--
-- Name: directus_operations directus_operations_reject_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_reject_foreign FOREIGN KEY (reject) REFERENCES public.directus_operations(id);


--
-- Name: directus_operations directus_operations_resolve_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_resolve_foreign FOREIGN KEY (resolve) REFERENCES public.directus_operations(id);


--
-- Name: directus_operations directus_operations_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_operations
    ADD CONSTRAINT directus_operations_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_panels directus_panels_dashboard_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_panels
    ADD CONSTRAINT directus_panels_dashboard_foreign FOREIGN KEY (dashboard) REFERENCES public.directus_dashboards(id) ON DELETE CASCADE;


--
-- Name: directus_panels directus_panels_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_panels
    ADD CONSTRAINT directus_panels_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_permissions directus_permissions_policy_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_permissions
    ADD CONSTRAINT directus_permissions_policy_foreign FOREIGN KEY (policy) REFERENCES public.directus_policies(id) ON DELETE CASCADE;


--
-- Name: directus_presets directus_presets_role_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_presets
    ADD CONSTRAINT directus_presets_role_foreign FOREIGN KEY (role) REFERENCES public.directus_roles(id) ON DELETE CASCADE;


--
-- Name: directus_presets directus_presets_user_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_presets
    ADD CONSTRAINT directus_presets_user_foreign FOREIGN KEY ("user") REFERENCES public.directus_users(id) ON DELETE CASCADE;


--
-- Name: directus_revisions directus_revisions_activity_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_revisions
    ADD CONSTRAINT directus_revisions_activity_foreign FOREIGN KEY (activity) REFERENCES public.directus_activity(id) ON DELETE CASCADE;


--
-- Name: directus_revisions directus_revisions_parent_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_revisions
    ADD CONSTRAINT directus_revisions_parent_foreign FOREIGN KEY (parent) REFERENCES public.directus_revisions(id);


--
-- Name: directus_revisions directus_revisions_version_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_revisions
    ADD CONSTRAINT directus_revisions_version_foreign FOREIGN KEY (version) REFERENCES public.directus_versions(id) ON DELETE CASCADE;


--
-- Name: directus_roles directus_roles_parent_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_roles
    ADD CONSTRAINT directus_roles_parent_foreign FOREIGN KEY (parent) REFERENCES public.directus_roles(id);


--
-- Name: directus_sessions directus_sessions_share_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_sessions
    ADD CONSTRAINT directus_sessions_share_foreign FOREIGN KEY (share) REFERENCES public.directus_shares(id) ON DELETE CASCADE;


--
-- Name: directus_sessions directus_sessions_user_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_sessions
    ADD CONSTRAINT directus_sessions_user_foreign FOREIGN KEY ("user") REFERENCES public.directus_users(id) ON DELETE CASCADE;


--
-- Name: directus_settings directus_settings_project_logo_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_settings
    ADD CONSTRAINT directus_settings_project_logo_foreign FOREIGN KEY (project_logo) REFERENCES public.directus_files(id);


--
-- Name: directus_settings directus_settings_public_background_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_settings
    ADD CONSTRAINT directus_settings_public_background_foreign FOREIGN KEY (public_background) REFERENCES public.directus_files(id);


--
-- Name: directus_settings directus_settings_public_favicon_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_settings
    ADD CONSTRAINT directus_settings_public_favicon_foreign FOREIGN KEY (public_favicon) REFERENCES public.directus_files(id);


--
-- Name: directus_settings directus_settings_public_foreground_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_settings
    ADD CONSTRAINT directus_settings_public_foreground_foreign FOREIGN KEY (public_foreground) REFERENCES public.directus_files(id);


--
-- Name: directus_settings directus_settings_public_registration_role_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_settings
    ADD CONSTRAINT directus_settings_public_registration_role_foreign FOREIGN KEY (public_registration_role) REFERENCES public.directus_roles(id) ON DELETE SET NULL;


--
-- Name: directus_settings directus_settings_storage_default_folder_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_settings
    ADD CONSTRAINT directus_settings_storage_default_folder_foreign FOREIGN KEY (storage_default_folder) REFERENCES public.directus_folders(id) ON DELETE SET NULL;


--
-- Name: directus_shares directus_shares_collection_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_shares
    ADD CONSTRAINT directus_shares_collection_foreign FOREIGN KEY (collection) REFERENCES public.directus_collections(collection) ON DELETE CASCADE;


--
-- Name: directus_shares directus_shares_role_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_shares
    ADD CONSTRAINT directus_shares_role_foreign FOREIGN KEY (role) REFERENCES public.directus_roles(id) ON DELETE CASCADE;


--
-- Name: directus_shares directus_shares_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_shares
    ADD CONSTRAINT directus_shares_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_users directus_users_role_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_users
    ADD CONSTRAINT directus_users_role_foreign FOREIGN KEY (role) REFERENCES public.directus_roles(id) ON DELETE SET NULL;


--
-- Name: directus_versions directus_versions_collection_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_versions
    ADD CONSTRAINT directus_versions_collection_foreign FOREIGN KEY (collection) REFERENCES public.directus_collections(collection) ON DELETE CASCADE;


--
-- Name: directus_versions directus_versions_user_created_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_versions
    ADD CONSTRAINT directus_versions_user_created_foreign FOREIGN KEY (user_created) REFERENCES public.directus_users(id) ON DELETE SET NULL;


--
-- Name: directus_versions directus_versions_user_updated_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_versions
    ADD CONSTRAINT directus_versions_user_updated_foreign FOREIGN KEY (user_updated) REFERENCES public.directus_users(id);


--
-- Name: directus_webhooks directus_webhooks_migrated_flow_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directus_webhooks
    ADD CONSTRAINT directus_webhooks_migrated_flow_foreign FOREIGN KEY (migrated_flow) REFERENCES public.directus_flows(id) ON DELETE SET NULL;


--
-- Name: orders orders_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: product_options product_options_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_options
    ADD CONSTRAINT product_options_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

