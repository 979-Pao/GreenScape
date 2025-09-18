import { useState } from "react";

export default function Contact(){
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const setVal = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const validators = {
    name: (v) => v.trim().length > 0 ? "" : "Completa el campo NOMBRE",
    email: (v) => {
      if (!v.trim()) return "Completa el campo CORREO";
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
      return re.test(v) ? "" : "Correo inválido";
    },
    phone: (v) => {
      const trimmed = v.trim();
      const onlyAllowedChars = /^[-\d+\s()]+$/.test(trimmed); // dígitos, +, espacios, paréntesis y guiones
      const ok = trimmed.length >= 6 && onlyAllowedChars;
      return ok ? "" : "Ingresa tu número de teléfono";
    },
    message: (v) => v.trim().length >= 5 ? "" : "Escribe al menos 5 caracteres",
  };

  const validateField = (k) => {
    const err = validators[k](form[k] || "");
    setErrors(s => ({ ...s, [k]: err }));
    return !err;
  };

  const validateAll = () => {
    const next = {};
    Object.keys(validators).forEach(k => next[k] = validators[k](form[k] || ""));
    setErrors(next);
    return Object.values(next).every(e => !e);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    // TODO: fetch('/api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    setSuccess(true);
    setForm({ name:"", email:"", phone:"", message:"" });
  };

  return (
    <section className="contact-us-section container" style={{ padding: "32px 0" }}>
      {/* BLOQUE INFORMATIVO (fuera del form) ✅ */}
      <div style={{ marginBottom: 16 }}>
        <h2 className="pager" style={{ color: "var(--green-medium)", margin: 0 }}>Contáctanos</h2>
        <p className="pager" style={{ marginTop: 8, color: "var(--gray-text)" }}>
          Puedes escribirnos a <b>info@green-space.com</b> o usar el formulario.
        </p>
      </div>

      {/* FORMULARIO (sin el segundo “Contáctanos”) ✅ */}
      <form className="contact-form" onSubmit={onSubmit} noValidate>
        <div className="field_name">
          <label htmlFor="full-name">Nombre completo</label>
          <div>
            <input
              type="text" id="full-name" name="full-name" placeholder="Escribe tu nombre completo"
              value={form.name} onChange={e=>setVal("name", e.target.value)} onBlur={()=>validateField("name")} required
            />
            {errors.name && <p className="errorForm">{errors.name}</p>}
          </div>
        </div>

        <div className="field_email-phone">
          <div>
            <label htmlFor="email">Correo electrónico</label>
            <div>
              <input
                type="email" id="email" name="email" placeholder="Escribe tu correo electrónico"
                value={form.email} onChange={e=>setVal("email", e.target.value)} onBlur={()=>validateField("email")} required
              />
              {errors.email && <p className="errorForm">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="phone">Teléfono</label>
            <div>
              <input
                type="text" id="phone" name="phone" placeholder="Escribe tu número de teléfono"
                value={form.phone} onChange={e=>setVal("phone", e.target.value)} onBlur={()=>validateField("phone")} required
              />
              {errors.phone && <p className="errorForm">{errors.phone}</p>}
            </div>
          </div>
        </div>

        <div className="field-message">
          <label htmlFor="message">Mensaje</label>
          <div>
            <textarea
              id="message" name="message" placeholder="Escribe tu mensaje aquí..."
              value={form.message} onChange={e=>setVal("message", e.target.value)} onBlur={()=>validateField("message")} required
            />
            {errors.message && <p className="errorForm">{errors.message}</p>}
          </div>
        </div>

        <button type="submit" className="submit">Enviar</button>

        {Object.values(errors).some(Boolean) && (
          <p className="errorForm" style={{ marginTop: 8 }}>
            Por favor, revisa los campos requeridos
          </p>
        )}

        {success && (
          <div className="success-message" style={{ marginTop: 12 }}>
            ✅ ¡Gracias! ¡Tu formulario se envió correctamente!
            <button type="button" className="close-btn" onClick={()=>setSuccess(false)}>✖</button>
          </div>
        )}
      </form>
    </section>
  );
}
