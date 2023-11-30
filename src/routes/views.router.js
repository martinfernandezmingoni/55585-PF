import { Router } from 'express'
import productModel from '../dao/models/products.model.js'
import messageModel from '../dao/models/messages.model.js'
import cartModel from '../dao/models/carts.model.js'

const router = Router()

router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10
        const page = parseInt(req.query.page) || 1
        const sort = req.query.sort || ''
        const category = req.query.category || ''
        const stock = parseInt(req.query.stock) || ''

        /* let filter = {}
        
        if (req.query.category) {
            filter = { category }
        }
        
        if (req.query.stock) {
            filter = { ...filter, stock: availability }
        } */
        
        const filter = {
            ...(category && { category }),
            ...(stock && { stock }),
        }

        let sortOptions = sort === 'asc' ? { price: 1 } : (sort === 'desc' ? { price: -1 } : {})
        
        /* if (sort === 'asc') {
            sortOptions = { price: 1 }
        } else if (sort === 'desc') {
            sortOptions = { price: -1 }
        }*/

        const options = {
            limit,
            page,
            sort: sortOptions,
            lean: true,
        } 
                
        const products = await productModel.paginate(filter, options)

        res.render('products', { products })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
})

router.get('/realTimeProducts', async (req, res) => {
    try {
        const allProducts = await productModel.find().lean().exec()
        res.render('realTimeProducts', { allProducts: allProducts })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
})

router.get('/chat', async (req, res) => {
    try {
        const messages = await messageModel.find().lean().exec()
        res.render('chat', { messages })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
})

router.get('/product/:pid', async (req, res) => {
    try {
        const pid = req.params.pid
        const product = await productModel.findById(pid).lean().exec()
        res.render('product', { product })
        if (product === null) {
            return res.status(404).json({ error: 'The product does not exist' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
})

router.get('/carts/:cid', async (req, res) => {
    try {
        const cid = req.params.cid
        const cart = await cartModel.findById(cid).lean().exec()
        if ((cart === null) || (cart.products.length === 0)) {
            const emptyCart = 'Cart Empty'
            req.app.get('socketio').emit('updatedCarts', cart.products)
            return res.render('carts', { emptyCart })
        }
        const carts = cart.products
        req.app.get('socketio').emit('updatedCarts', carts)

        res.render('carts', { carts })

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
})

export default router
