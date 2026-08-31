import { useState, useEffect, useMemo } from "react";
import { Droplet, MapPin, Plus, X, Loader2, Clock, Send, CheckCircle2, Globe } from "lucide-react";
import { supabase } from "./supabaseClient";

const SOURCE_TYPES_FR = [
  "Fontaine publique",
  "Camion-citerne",
  "Distribution municipale",
  "Puits",
  "Source naturelle",
  "Autre",
];
const SOURCE_TYPES_AR = [
  "فسقية عمومية",
  "كاميو صهريج",
  "توزيع بلدي",
  "بئر",
  "عين ماء",
  "أخرى",
];
const SOURCE_KEYS = ["fontaine", "camion", "distribution", "puits", "source", "autre"];

const SOURCE_COLORS = {
  fontaine: "#1D5D9B",
  camion: "#B5541F",
  distribution: "#1D5D9B",
  puits: "#4C7A5E",
  source: "#4C7A5E",
  autre: "#6B5B45",
};

const CITY_COORDS = {
  "tunis": { x: 53, y: 7 }, "ariana": { x: 54, y: 6 }, "ben arous": { x: 54, y: 9 },
  "manouba": { x: 51, y: 7 }, "bizerte": { x: 48, y: 2 }, "nabeul": { x: 61, y: 11 },
  "beja": { x: 38, y: 9 }, "jendouba": { x: 30, y: 11 }, "le kef": { x: 30, y: 19 },
  "kef": { x: 30, y: 19 }, "siliana": { x: 39, y: 21 }, "zaghouan": { x: 48, y: 17 },
  "sousse": { x: 59, y: 27 }, "monastir": { x: 61, y: 30 }, "mahdia": { x: 58, y: 34 },
  "kairouan": { x: 45, y: 29 }, "kasserine": { x: 27, y: 31 }, "sidi bouzid": { x: 38, y: 37 },
  "sfax": { x: 55, y: 44 }, "gafsa": { x: 24, y: 44 }, "tozeur": { x: 14, y: 49 },
  "kebili": { x: 26, y: 57 }, "gabes": { x: 50, y: 54 }, "gabès": { x: 50, y: 54 },
  "medenine": { x: 55, y: 67 }, "médenine": { x: 55, y: 67 }, "tataouine": { x: 45, y: 78 },
  "djerba": { x: 60, y: 62 },
};

const T = {
  fr: {
    dir: "ltr", brand: "Nqta",
    heading: ["Où trouver de l'eau,", "ville par ville."],
    sub: "Face aux coupures, chacun signale où il a trouvé de l'eau. Cherche ta ville, ou ajoute ce que tu as trouvé pour aider quelqu'un d'autre.",
    searchPlaceholder: "Nom de ta ville (ex : Sfax, Sousse, Kairouan…)",
    loading: "Chargement des signalements…",
    loadError: "Impossible de charger les signalements. Vérifie ta connexion.",
    emptyTitle: (q) => `Rien pour « ${q} » pour l'instant.`,
    emptyText: "Sois la première personne à signaler un point d'eau dans cette ville.",
    mapHint: "Touche un point sur la carte pour voir les signalements de cette ville.",
    mapEmpty: "Aucun signalement encore. La carte se remplit au fur et à mesure.",
    addToggleOn: "Annuler", addToggleOff: "Signaler un point d'eau",
    formCity: "Ville", formCityPh: "Ex : Nabeul",
    formType: "Type de point d'eau", formDesc: "Description",
    formDescPh: "Ex : Camion-citerne passe rue Habib Bourguiba vers 17h.",
    formErrorEmpty: "Indique une ville et une courte description.",
    formErrorFail: "L'enregistrement a échoué. Réessaie.",
    submit: "Publier", submitting: "Envoi…",
    disclaimer: "Ce que tu publies ici est visible par toutes les personnes qui utilisent Nqta.",
    confirm: "Toujours valable", confirming: "…",
    confirmedOnce: (n) => `Confirmé ${n} fois`, confirmedNever: "Pas encore confirmé",
    lastConfirmed: (t) => `dernière confirmation ${t}`,
    timeJustNow: "à l'instant", timeMin: (n) => `il y a ${n} min`,
    timeHour: (n) => `il y a ${n} h`, timeDay: (n) => `il y a ${n} j`,
    langLabel: "AR",
  },
  ar: {
    dir: "rtl", brand: "نقطة",
    heading: ["فين تلقى الماء،", "مدينة بمدينة."],
    sub: "قدام انقطاعات الماء، كل واحد يعلم وين لقى الماء. دور على مدينتك، أو زيد نقطة باش تعاون شخص آخر.",
    searchPlaceholder: "اسم مدينتك (مثال: صفاقس، سوسة، القيروان…)",
    loading: "التحميل…",
    loadError: "تعذر تحميل الإشعارات. تأكد من الاتصال بالإنترنت.",
    emptyTitle: (q) => `ما فماش نتائج لـ«${q}» حاليا.`,
    emptyText: "كون أول واحد يعلم بنقطة ماء في هالمدينة.",
    mapHint: "دوس على نقطة في الخريطة باش تشوف الإشعارات متاع هالمدينة.",
    mapEmpty: "مازال ما فماش إشعارات. الخريطة تتعمر شوي بشوي.",
    addToggleOn: "إلغاء", addToggleOff: "أعلم بنقطة ماء",
    formCity: "المدينة", formCityPh: "مثال: نابل",
    formType: "نوع نقطة الماء", formDesc: "الوصف",
    formDescPh: "مثال: الكاميو صهريج يعدي في شارع الحبيب بورقيبة نحو 17:00.",
    formErrorEmpty: "لازم تكتب اسم المدينة ووصف قصير.",
    formErrorFail: "ما نجمناش نسجلو. عاود جرب.",
    submit: "نشر", submitting: "جاري النشر…",
    disclaimer: "كل شي تنشره هنا يبان لكل الناس اللي تستعمل نقطة.",
    confirm: "مازال صحيح", confirming: "…",
    confirmedOnce: (n) => `تأكد ${n} مرات`, confirmedNever: "مازال ما تأكدش",
    lastConfirmed: (t) => `آخر تأكيد ${t}`,
    timeJustNow: "توا", timeMin: (n) => `من ${n} د`,
    timeHour: (n) => `من ${n} س`, timeDay: (n) => `من ${n} يوم`,
    langLabel: "FR",
  },
};

function stripAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function timeAgo(iso, t) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t.timeJustNow;
  if (mins < 60) return t.timeMin(mins);
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t.timeHour(hrs);
  return t.timeDay(Math.floor(hrs / 24));
}

function fromRow(row) {
  return {
    id: row.id,
    city: row.city,
    sourceKey: row.source_key,
    description: row.description,
    addedAt: row.added_at,
    confirmations: row.confirmations || [],
  };
}

export default function App() {
  const [lang, setLang] = useState("fr");
  const t = T[lang];
  const SOURCE_TYPES = lang === "fr" ? SOURCE_TYPES_FR : SOURCE_TYPES_AR;

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ city: "", sourceKey: SOURCE_KEYS[0], description: "" });

  async function loadEntries() {
    setLoading(true);
    setLoadError(false);
    const { data, error: fetchError } = await supabase
      .from("entries")
      .select("*")
      .order("added_at", { ascending: false });
    if (fetchError) {
      setLoadError(true);
    } else {
      setEntries((data || []).map(fromRow));
    }
    setLoading(false);
  }

  useEffect(() => {
    loadEntries();

    const channel = supabase
      .channel("entries-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "entries" }, () => {
        loadEntries();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = stripAccents(query);
    return entries.filter((e) => stripAccents(e.city).includes(q));
  }, [entries, query]);

  const mapCities = useMemo(() => {
    const counts = {};
    for (const e of entries) {
      const key = stripAccents(e.city);
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts)
      .filter(([key]) => CITY_COORDS[key])
      .map(([key, count]) => ({ key, count, ...CITY_COORDS[key] }));
  }, [entries]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.city.trim() || !form.description.trim()) {
      setError(t.formErrorEmpty);
      return;
    }
    setSubmitting(true);
    setError("");
    const { error: insertError } = await supabase.from("entries").insert([
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        city: form.city.trim(),
        source_key: form.sourceKey,
        description: form.description.trim(),
        added_at: new Date().toISOString(),
        confirmations: [],
      },
    ]);
    if (insertError) {
      setError(t.formErrorFail);
    } else {
      setQuery(form.city.trim());
      setForm({ city: "", sourceKey: SOURCE_KEYS[0], description: "" });
      setShowForm(false);
      await loadEntries();
    }
    setSubmitting(false);
  }

  async function handleConfirm(entry) {
    setConfirmingId(entry.id);
    const nextConfirmations = [...(entry.confirmations || []), new Date().toISOString()];
    const { error: updateError } = await supabase
      .from("entries")
      .update({ confirmations: nextConfirmations })
      .eq("id", entry.id);
    if (!updateError) await loadEntries();
    setConfirmingId(null);
  }

  return (
    <div style={styles.page} dir={t.dir}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Public+Sans:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        input, select, textarea, button { font-family: inherit; }
        input:focus, select:focus, textarea:focus, button:focus-visible { outline: 2px solid #1D5D9B; outline-offset: 2px; }
        ::placeholder { color: #8A7D66; }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        circle.city-dot { cursor: pointer; transition: r 0.15s ease; }
        circle.city-dot:hover { r: 6; }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
      `}</style>

      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.brand}>
            <Droplet size={22} color="#1D5D9B" fill="#1D5D9B" />
            <span style={{ ...styles.brandName, fontFamily: lang === "ar" ? "'Noto Kufi Arabic', sans-serif" : "'Fraunces', serif" }}>
              {t.brand}
            </span>
          </div>
          <button style={styles.langBtn} onClick={() => setLang((l) => (l === "fr" ? "ar" : "fr"))} aria-label="Changer de langue">
            <Globe size={15} /> {t.langLabel}
          </button>
        </div>
      </header>

      <main style={{ ...styles.main, fontFamily: lang === "ar" ? "'Noto Kufi Arabic', sans-serif" : "'Public Sans', sans-serif" }}>
        <h1 style={{ ...styles.h1, fontFamily: lang === "ar" ? "'Noto Kufi Arabic', sans-serif" : "'Fraunces', serif" }}>
          {t.heading[0]}<br />{t.heading[1]}
        </h1>
        <p style={styles.sub}>{t.sub}</p>

        <div style={styles.searchBar}>
          <MapPin size={18} color="#8A7D66" style={{ flexShrink: 0 }} />
          <input style={styles.searchInput} placeholder={t.searchPlaceholder} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div style={styles.mapWrap}>
          <svg viewBox="0 0 100 100" style={styles.mapSvg} role="img" aria-label="Carte de la Tunisie">
            <path
              d="M 45 0 L 55 0 L 60 8 L 65 12 L 62 20 L 58 30 L 60 40 L 57 48 L 52 55 L 58 62 L 52 72 L 46 82 L 40 78 L 38 65 L 32 55 L 28 45 L 22 42 L 20 50 L 14 48 L 18 35 L 26 28 L 24 18 L 32 10 L 40 6 Z"
              fill="#E3D3A9" stroke="#C9B583" strokeWidth="0.6"
            />
            {mapCities.map((c) => (
              <circle key={c.key} className="city-dot" cx={c.x} cy={c.y} r={3 + Math.min(c.count, 5) * 0.6}
                fill="#B5541F" fillOpacity="0.85" stroke="#FAF5E9" strokeWidth="0.6" onClick={() => setQuery(c.key)}>
                <title>{c.key} ({c.count})</title>
              </circle>
            ))}
          </svg>
          <p style={styles.mapCaption}>{mapCities.length === 0 ? t.mapEmpty : t.mapHint}</p>
        </div>

        {loading ? (
          <div style={styles.stateRow}>
            <Loader2 size={16} color="#8A7D66" className="spin" />
            <span style={{ color: "#8A7D66" }}>{t.loading}</span>
          </div>
        ) : loadError ? (
          <div style={styles.stateRow}>
            <span style={{ color: "#A02B2B" }}>{t.loadError}</span>
          </div>
        ) : query.trim() && results.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ ...styles.emptyTitle, fontFamily: lang === "ar" ? "'Noto Kufi Arabic', sans-serif" : "'Fraunces', serif" }}>
              {t.emptyTitle(query.trim())}
            </p>
            <p style={styles.emptyText}>{t.emptyText}</p>
          </div>
        ) : (
          <ul style={styles.results}>
            {results.map((e) => {
              const confirmations = e.confirmations || [];
              const lastConfirm = confirmations[confirmations.length - 1];
              return (
                <li key={e.id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <span style={{ ...styles.badge, color: SOURCE_COLORS[e.sourceKey] || "#6B5B45", borderColor: SOURCE_COLORS[e.sourceKey] || "#6B5B45" }}>
                      {SOURCE_TYPES[SOURCE_KEYS.indexOf(e.sourceKey)] || e.sourceKey}
                    </span>
                    <span style={styles.time}><Clock size={12} /> {timeAgo(e.addedAt, t)}</span>
                  </div>
                  <p style={{ ...styles.cardCity, fontFamily: lang === "ar" ? "'Noto Kufi Arabic', sans-serif" : "'Fraunces', serif" }}>{e.city}</p>
                  <p style={styles.cardDesc}>{e.description}</p>
                  <div style={styles.confirmRow}>
                    <span style={styles.confirmText}>
                      {confirmations.length > 0
                        ? `${t.confirmedOnce(confirmations.length)} · ${t.lastConfirmed(timeAgo(lastConfirm, t))}`
                        : t.confirmedNever}
                    </span>
                    <button style={styles.confirmBtn} onClick={() => handleConfirm(e)} disabled={confirmingId === e.id}>
                      {confirmingId === e.id ? <Loader2 size={13} className="spin" /> : <CheckCircle2 size={13} />}
                      {confirmingId === e.id ? t.confirming : t.confirm}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <button style={styles.addToggle} onClick={() => setShowForm((s) => !s)}>
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? t.addToggleOn : t.addToggleOff}
        </button>

        {showForm && (
          <form style={styles.form} onSubmit={handleSubmit}>
            <label style={styles.label}>
              {t.formCity}
              <input style={styles.input} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder={t.formCityPh} />
            </label>
            <label style={styles.label}>
              {t.formType}
              <select style={styles.input} value={form.sourceKey} onChange={(e) => setForm({ ...form, sourceKey: e.target.value })}>
                {SOURCE_KEYS.map((key, i) => (<option key={key} value={key}>{SOURCE_TYPES[i]}</option>))}
              </select>
            </label>
            <label style={styles.label}>
              {t.formDesc}
              <textarea style={{ ...styles.input, minHeight: 80, resize: "vertical" }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t.formDescPh} />
            </label>
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" style={styles.submit} disabled={submitting}>
              {submitting ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
              {submitting ? t.submitting : t.submit}
            </button>
            <p style={styles.disclaimer}>{t.disclaimer}</p>
          </form>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#EDE0C8", color: "#2B2118" },
  header: { borderBottom: "1px solid #DCCBA3", background: "#EDE0C8", position: "sticky", top: 0, zIndex: 10 },
  headerInner: { maxWidth: 560, margin: "0 auto", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  brand: { display: "flex", alignItems: "center", gap: 8 },
  brandName: { fontWeight: 600, fontSize: 20, color: "#163F63" },
  langBtn: { display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", background: "transparent", border: "1.5px solid #C9B583", borderRadius: 8, color: "#4A3F2F", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  main: { maxWidth: 560, margin: "0 auto", padding: "28px 20px 60px" },
  h1: { fontWeight: 600, fontSize: "clamp(28px, 6vw, 38px)", lineHeight: 1.2, margin: "0 0 12px", color: "#163F63" },
  sub: { fontSize: 15.5, lineHeight: 1.55, color: "#4A3F2F", margin: "0 0 24px", maxWidth: 460 },
  searchBar: { display: "flex", alignItems: "center", gap: 10, background: "#FAF5E9", border: "1.5px solid #D2BF93", borderRadius: 10, padding: "12px 14px", marginBottom: 18 },
  searchInput: { flex: 1, border: "none", background: "transparent", fontSize: 15.5, color: "#2B2118" },
  mapWrap: { background: "#FAF5E9", border: "1px solid #DCCBA3", borderRadius: 12, padding: "14px 14px 10px", marginBottom: 20 },
  mapSvg: { width: "100%", height: "auto", maxHeight: 260, display: "block", margin: "0 auto" },
  mapCaption: { fontSize: 12.5, color: "#8A7D66", margin: "8px 0 0", textAlign: "center" },
  stateRow: { display: "flex", alignItems: "center", gap: 8, padding: "20px 4px", fontSize: 14.5 },
  empty: { padding: "24px 4px", borderTop: "1px solid #DCCBA3" },
  emptyTitle: { fontSize: 18, fontWeight: 600, margin: "0 0 6px", color: "#163F63" },
  emptyText: { fontSize: 14.5, color: "#5C5140", margin: 0 },
  results: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 },
  card: { background: "#FAF5E9", border: "1px solid #DCCBA3", borderRadius: 10, padding: "14px 16px" },
  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  badge: { fontSize: 12.5, fontWeight: 600, border: "1px solid", borderRadius: 999, padding: "2px 10px" },
  time: { display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#8A7D66" },
  cardCity: { fontSize: 17, fontWeight: 600, margin: "0 0 4px", color: "#2B2118" },
  cardDesc: { fontSize: 14.5, lineHeight: 1.5, margin: "0 0 10px", color: "#4A3F2F" },
  confirmRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, paddingTop: 10, borderTop: "1px dashed #DCCBA3", flexWrap: "wrap" },
  confirmText: { fontSize: 12, color: "#6B5B45" },
  confirmBtn: { display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", background: "#4C7A5E", color: "#FAF5E9", border: "none", borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: "pointer" },
  addToggle: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", marginTop: 24, padding: "13px 16px", background: "#B5541F", color: "#FAF5E9", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" },
  form: { display: "flex", flexDirection: "column", gap: 14, marginTop: 18, padding: 18, background: "#FAF5E9", border: "1px solid #DCCBA3", borderRadius: 12 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 13.5, fontWeight: 600, color: "#4A3F2F" },
  input: { border: "1.5px solid #D2BF93", borderRadius: 8, padding: "10px 12px", fontSize: 15, color: "#2B2118", background: "#fff", fontWeight: 400 },
  error: { fontSize: 13.5, color: "#A02B2B", margin: 0 },
  submit: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 16px", background: "#1D5D9B", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" },
  disclaimer: { fontSize: 12, color: "#8A7D66", margin: 0, textAlign: "center" },
};

