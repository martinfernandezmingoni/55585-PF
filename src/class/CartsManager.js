import { Router } from 'express';
import fs from 'fs'

const router = Router();

let id = 0
const path = './files/carts.json'
const producstPath = './files/products.json'
const format = 'utf-8'

async function readCarts() {
  try {
    const data =  await fs.promises.readFile(path, format)
    const carts = JSON.parse(data)

    if(carts.length > 0) {
      id = Math.max(...carts.map(c => c.id))
    }
    return carts
  } catch (error) {
    console.log(error)
    return[]
  }
}

async function readProducts() {
  try {
    const data = await fs.promises.readFile(producstPath, format)
    return JSON.parse(data)
  } catch (error) {
    console.log(error)
  }
}

router.post('/', async (req, res) => {
  try {
    const carts = await readCarts()
    const newCart = {
      id: id + 1,
      products: [],
    };

    carts.push(newCart);

    await fs.promises.writeFile(path, JSON.stringify(carts, null, 2), format);
    id = newCart.id

    res.json(newCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el carrito' });
  }
});

router.get('/', async (req,res) => {
  try {
    const data = await fs.promises.readFile(path, format)
    const carts = JSON.parse(data)
    res.json(carts)

  } catch (error) {
    console.log(error)
    res.json(error)
  }
})

router.get('/:cid', async (req, res) => {
  try {
    const cartId = parseInt(req.params.cid, 10)

    const carts = await readCarts()
    const cart = carts.find((c) => c.id === cartId);

    if (!cart) {
      res.status(404).json({ error: 'Carrito no encontrado' });
    } else {
      res.json(cart.products);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los productos del carrito' });
  }
});

router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cartId = parseInt(req.params.cid, 10)
    const productId = parseInt(req.params.pid, 10)
    const quantity = 1

    const carts = await readCarts(  )
    const cart = carts.find((c) => c.id === cartId);

    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });   
    }

    const products = await readProducts()
    const product = products.find((p) => p.id === productId)

    if(!product){
      return res.status(404).json({error: 'Producto no Existe'})
    }

    const existingProduct = cart.products.find((p) => p.product === productId)

    if (existingProduct) {
      existingProduct.quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity});
      }

      await fs.promises.writeFile(path, JSON.stringify(carts, null, 2), format);

      res.json(cart.products);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar el producto al carrito' });
  }
});

const CartsManager = router;
export default CartsManager