const express = require('express');
const app = express();
const { products } = require('./data');

// Function to create the HTML response for products
const createHtmlResponse = (data, search = '') => {
  let html = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f4f4f4;
          }
          .product {
            border: 1px solid #ccc;
            border-radius: 5px;
            padding: 10px;
            margin-bottom: 15px;
            background-color: #fff;
          }
          .product img {
            max-width: 100px;
          }
          .product h2 {
            font-size: 1.5em;
            margin: 0;
          }
          .search {
            margin-bottom: 20px;
          }
          .search input {
            padding: 5px;
            margin-right: 5px;
          }
          .search button {
            padding: 5px;
          }
        </style>
      </head>
      <body>
        <h1>Product Catalog</h1>
        <div class="search" style="text-align: right;">
          <form action="/api/v1/query" method="GET">
            <input type="text" name="search" placeholder="Search for products..." value="${search}" />
            <input type="number" name="limit" placeholder="Limit" min="1" />
            <button type="submit">Search</button>
          </form>
        </div>
  `;

  if (Array.isArray(data)) {
    data.forEach(item => {
      html += `
        <div class="product">
          <h2>${item.id}: ${item.name}</h2>
          <img src="${item.image}" alt="${item.name}">
          <p><a href="/api/products/${item.id}">More Info</a></p>
        </div>
      `;
    });
  } else if (data) { // When it's a single product
    html += `
      <div class="product">
        <h2>${data.name}</h2>
        <img src="${data.image}" alt="${data.name}">
        <p>Price: $${data.price}</p>
        <p>Description: ${data.desc}</p>
        <a href="/">Back to Products</a>
      </div>
    `;
  } else {
    html += '<h2>No products found</h2>';
  }

  html += `
      </body>
    </html>
  `;
  
  return html;
};

app.get('/', (req, res) => {
  const htmlResponse = createHtmlResponse(products);
  res.send(htmlResponse);
});

app.get('/api/products', (req, res) => {
  const newProducts = products.map(({ id, name, image }) => ({ id, name, image }));
  const htmlResponse = createHtmlResponse(newProducts);
  res.send(htmlResponse);
});

app.get('/api/products/:productID', (req, res) => {
  const { productID } = req.params;
  const singleProduct = products.find((product) => product.id === Number(productID));
  
  if (!singleProduct) {
    return res.status(404).send('<h2>Product Does Not Exist</h2>');
  }
  
  const htmlResponse = createHtmlResponse(singleProduct);
  res.send(htmlResponse);
});

app.get('/api/v1/query', (req, res) => {
  const { search, limit } = req.query;
  let sortedProducts = [...products];

  if (search) {
    sortedProducts = sortedProducts.filter(product => product.name.toLowerCase().includes(search.toLowerCase()));
  }
  
  if (limit) {
    sortedProducts = sortedProducts.slice(0, Number(limit));
  }

  const htmlResponse = createHtmlResponse(sortedProducts, search);
  res.status(200).send(htmlResponse);
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}....`);
});
