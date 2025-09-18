export default function Footer(){
  return (
    <footer className="site-footer">
      <div className="section-footer container">
        <div className="footer-section-logo">
          <img src="src/assets/images/greentree.png" alt="Logo" className="img-logo" />
          <p>
            Colección de plantas de interior y exterior para embellecer tu hogar y cuidar tu bienestar. Nacimos para reconectar tu vida con lo natural.
          </p>
          <div className="social-links">
          <p><i className="fa-solid fa-phone"></i> +34 (321) 123-456</p>
          <p><i className="fa-regular fa-envelope"></i> info@green-space.com</p>
          </div>
        </div>
        <div className="footer-links">
          <div className="footer-column">
            <h4>Compañía</h4>
            <ul>
              <li><a href="#">Sobre Nosotros</a></li>
              <li><a href="#">Política de Privacidad</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Servicio al cliente</h4>
            <ul>
              <li><a href="#">Preguntas Frecuentes</a></li>
              <li><a href="#">Términos de uso</a></li>
            </ul>
          </div>
          <div className="footer-column newsletter">
            <h4>Únete a nuestra newsletter</h4>
            <p>Llévate 15% de descuento en tu primer pedido al suscribirte a nuestro boletín informativo</p>
            <form className="newsletter-form" onSubmit={(e)=>e.preventDefault()}>
              <input type="email" placeholder="Tu correo electrónico" />
              <button type="submit"><i className="fas fa-arrow-right"></i></button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
}
