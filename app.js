import express from "express"
import cors from "cors"
import 'dotenv/config'
import { conectarMongo } from "./database/cnx-mongo.js"
import usuarioRoute from "./routes/usuario.js"
import pagoRoute from "./routes/pago.js"
import lecturaRoute from "./routes/lectura.js"

const app = express()
conectarMongo()

app.use(cors())
app.use(express.json())

app.use("/api/usuario",usuarioRoute)
app.use("/api/lectura",lecturaRoute)
app.use("/api/pago",pagoRoute)

app.listen(process.env.PORT,()=>{
    console.log(`Servidor escuchando en el puerto ${process.env.PORT}`);
})
