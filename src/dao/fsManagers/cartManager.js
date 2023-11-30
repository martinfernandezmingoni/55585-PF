import fs from "fs"
import { __dirname } from "../../utils.js"
import { productManager } from "./productManager.js"

class CartManager {
    #path
    #format
    constructor(path) {
        this.#path = path
        this.#format = "utf-8"
        this.carts = []
    }

    getCarts = async () => {
        try {
            return JSON.parse(await fs.promises.readFile(this.#path, this.#format))
        } catch (error) {
            console.log("error: archivo no encontrado")
            return []
        }
    }

    getCartsById = async (id) => {
        const carts = await this.getCarts()
        const cart = carts.find((prod) => prod.id === id)
        return cart 
    }

    #generateId = async () => {
        const carts = await this.getCarts()
        return carts.length === 0 ? 1 : carts[carts.length - 1].id + 1
    }

    addCart = async (products) => {
        const carts = await this.getCarts()

        const newCart = {
            id: await this.#generateId(),
            products: (products = []),
        }

        carts.push(newCart)

        await fs.promises.writeFile(this.#path, JSON.stringify(carts, null, "\t"))

        this.carts = carts

        return newCart
    }

    addProductsToCart = async (cartId, productId) => {
        const products = productManager.getProductsById(productId)

        if (!products) return `Error el producto con el id:${productId} no existe`
        
        let carts = await this.getCarts()

        const cart = await this.getCartsById(cartId)

        if (!cart) return null
        
        const existingProduct = cart.products.find(item => item.product === productId)
        
        if (existingProduct) {
            existingProduct.quantity++
        } else {
            const product = {
                product: productId,
                quantity: 1,
            }
            cart.products.push(product)
        }

        const cartIndex = carts.findIndex(item => item.id === cartId)
        
        if (cartIndex !== -1) {
            carts[cartIndex] = cart
        }

        await fs.promises.writeFile(this.#path, JSON.stringify(carts, null, "\t"))

        return cart
    }
}

export const cartManager = new CartManager(`${__dirname}/api/carrito.json`)
