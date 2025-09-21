export default function Features(){
  return (
    <section className="section-features container">
      <div className="title">
        <h2>Las <span>plantas</span> oxigenan nuestra vida.</h2>
      </div>
      <div className="img-1">
        <img src="public/img/Feature-2.png" alt="Image Section Features 2" />
      </div>
      <div className="img-2">
        <img src="public/img/Feature-1.png" alt="Image Section Features 1" />
        <div className="shadow"></div>
      </div>
      <div className="row-info">
        <span><p className="number">+35</p><p>Nuevos productos</p></span>
        <span><p className="number">+50</p><p>Clientes satisfechos</p></span>
        <span><p className="number">+120</p><p>Envíos realizados</p></span>
      </div>
      <div className="row-buttons-info">
        <button>Ordenar Ahora <i className="fa-solid fa-circle-chevron-right"></i></button>
        <button><i className="fa-solid fa-book-open"></i> Conocer más</button>
      </div>
    </section>
  );
}
