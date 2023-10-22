import { Router } from 'express'
import fs from 'fs'

const router = Router()

let id = 0
const path = './files/products.json'
const format = 'utf-8'

async function generateId() {
  try {
    const data =  await fs.promises.readFile(path, format)
    const producst = JSON.parse(data)

    if(producst.length > 0) {
      id = Math.max(...producst.map(p => p.id))
    }
    return producst
  } catch (error) {
    console.log(error)
    return[]
  }
}

router.get('/', async (req,res) => {
  try {
    const products = await generateId()
    res.json(products)
    
  } catch (error) {
    console.log(error)
    res.json({error})
  }

})

router.get('/:pid', async (req,res) =>{
  try {
    const productId = req.params.pid

    const data = await fs.promises.readFile(path, format)
    const products = JSON.parse(data)

    const product = products.find((p) => p.id === productId)

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    res.json({message:product})
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Error al obtener el producto' })
    
  }
})


router.post('/', async (req, res) => {
  try {
    const { title, description, code, price, stock, category, thumbnails } = req.body

    if (!title || !description || !code || !price || !stock || !category) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' })
    }

    const products = await generateId()

    const codeExists = products.some(product => product.code === code);
    if (codeExists) {
      return res.status(400).json({ error: 'El código de producto ya existe' });
    }
    
    const newProduct = {
      id: id + 1 ,
      title,
      description,
      code,
      price,
      status: true,
      stock,
      category,
      thumbnails: thumbnails || []
    }

    products.push(newProduct)

    await fs.promises.writeFile(path, JSON.stringify(products, null, 2), format)

    id = newProduct.id

    res.json(newProduct)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al agregar el producto' })
  }
})

router.patch('/:pid', async (req, res) => {
  try {
    const productId = req.params.pid
    const { title, description, code, price, stock, category, thumbnails } = req.body

    const data = await fs.promises.readFile(path, format)
    const products = JSON.parse(data)

    const product = products.find((p) => p.id === productId)

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    product.title = title || product.title
    product.description = description || product.description
    product.code = code || product.code
    product.price = price || product.price
    product.stock = stock || product.stock
    product.category = category || product.category
    product.thumbnails = thumbnails || product.thumbnails

    await fs.promises.writeFile(path, JSON.stringify(products, null, 2), format)

    res.json(product)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al actualizar el producto' })
  }
})


router.delete('/:pid', async (req, res) => {
  try {
    const productId = req.params.pid

    const data = await fs.promises.readFile(path, format)
    const products = JSON.parse(data)

    const index = products.findIndex((product) => product.id === productId)

    if (index === -1) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    products.splice(index, 1)

    await fs.promises.writeFile(path, JSON.stringify(products, null, 2), format)

    res.json({ message: 'Producto eliminado correctamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al eliminar el producto' })
  }
})


const ProductManager = router
export default ProductManager