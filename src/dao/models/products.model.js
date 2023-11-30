import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const productSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    thumbnails: {
        type: [String],
        default: []
    },
    code: {
        type: String, 
        required: true,
        unique: true
    },
    category: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    status:{
        type: Boolean,
        default: true
    }
})

productSchema.plugin(mongoosePaginate)

const productModel = mongoose.model('products', productSchema)

export default productModel
