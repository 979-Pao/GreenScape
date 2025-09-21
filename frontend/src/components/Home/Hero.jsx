export default function Hero(){
  return (
    <section className="section-hero container">
           <div className="container-img-hero">
        <div className="img-hero">
          <img src="public/header.plant.png" alt="Header Img" />
        </div>
        <div className="message-float-header">
          <i className="fa-solid fa-gift"></i>
          <span>
            <p>Best sellers verdes</p>
            <p>Explora plantas destacadas</p>
          </span>
        </div>
      </div>
     
      <div className="info">
        <h1>Ponle <span>verde</span> al mundo🌿</h1>
        <p>
          Plantas y flores que embellecen tu espacio y elevan tu bienestar. Comparte ese brillo con los tuyos. Simple, bonito, natural.
        </p>
        <div className="container-buttons-header">
          <button>Ordenar Ahora <i className="fa-solid fa-circle-chevron-right"></i></button>
          <button><i className="fa-regular fa-circle-play"></i> ¿Cómo funciona?</button>
        </div>
      </div>

    </section>
  );
}
