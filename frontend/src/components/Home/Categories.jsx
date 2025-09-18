export default function Categories(){
  return (
    <section className="section-categories container">
      <h2>Categorías</h2>
      <div className="container-cards-categories">
        <div className="card-category">
          <div className="img-category"><img src="src/assets/images/categ.1.png" alt="Category 1" /></div>
          <h3>Plantas de Interior</h3>
        </div>
        <div className="card-category">
          <div className="img-category"><img src="src/assets/images/categ.2.png" alt="Category 2" /></div>
          <h3>Plantas de Exterior</h3>
        </div>
        <div className="card-category">
          <div className="img-category"><img src="src/assets/images/categ.3.png" alt="Category 4" /></div>
          <h3>Flores</h3>
        </div>
      </div>
    </section>
  );
}
