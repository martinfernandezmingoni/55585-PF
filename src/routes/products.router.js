import { Router } from 'express'
import uploader from '../storage.js'
import productModel from '../dao/models/products.model.js'

const router = Router()
const upload = uploader.array('thumbnails', 2)

router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10
        const page = parseInt(req.query.page) || 1
        const sort = req.query.sort || ''
        const category = req.query.category || ''
        const stock = parseInt(req.query.stock) || ''

        const filter = {
            ...(category && { category }),
            ...(stock && { stock })
        }

        const sortOptions = sort === 'asc' ? { price: 1 } : (sort === 'desc' ? { price: -1 } : {})

        const options = {
            limit,
            page,
            sort: sortOptions,
        } 

        const result = await productModel.paginate(filter, options)
        const totalPages = result.totalPages
        const prevPage = result.prevPage
        const nextPage = result.nextPage
        const currentPage = result.page
        const hasPrevPage = result.hasPrevPage
        const hasNextPage = result.hasNextPage
        const prevLink = hasPrevPage ? `/api/products?page=${prevPage}` : null
        const nextLink = hasNextPage ? `/api/products?page=${nextPage}` : null

        res.status(200).json({
            status: 'success',
            payload: result.docs,
            totalPages,
            prevPage,
            nextPage,
            page: currentPage,
            hasPrevPage,
            hasNextPage,
            prevLink,
            nextLink,
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
})

router.get('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid
        const product = await productModel.findById(pid)
        if (product === null) {
            return res.status(404).json({ error: 'The product does not exist' })
        }
        res.status(200).json({ payload: product })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message })
    }
})

router.post('/', upload, async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files have been sent' })
        }
        
        const product = req.body
        product.thumbnails = req.files.map(file => file.filename)

        const addProduct = await productModel.create(product)
        const products = await productModel.find().lean().exec()
        req.app.get('socketio').emit('updatedProducts', products)
        res.status(201).json({ status: 'success', payload: addProduct })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message })
    }
})

router.put('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid
        if (req.body.id !== pid && req.body.id !== undefined) {
            return res .status(404).json({ error: 'Cannot modify product id' })
        }

        const updated = req.body
        const productFind = await productModel.findById(pid)
        if (!productFind) {
            return res.status(404).json({ error: 'The product does not exist' })
        }

        await productModel.updateOne({ _id: pid }, updated)
        const updatedProducts = await productModel.find()

        req.app.get('socketio').emit('updatedProducts', updatedProducts)
        res.status(200).json({ message: `Updating the product: ${productFind.title}` })

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
})

router.delete('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid
        const result = await productModel.findByIdAndDelete(pid)
        if (result === null) {
            return res.status(404).json({ status: 'error', error: `No such product with id: ${pid}` })
        }
        
        const updatedProducts = await productModel.find().lean().exec()
        
        req.app.get('socketio').emit('updatedProducts', updatedProducts)
        res.status(200).json({ message: `Product with id ${pid} removed successfully`, products:  updatedProducts })

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
})

export default router