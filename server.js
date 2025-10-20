import express, { request, response } from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cors from 'cors'
dotenv.config()
const app = express()
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('database connected'))
    .catch((error) => console.log('database cannot connected', error))
const peoplesschema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true,unique:true },
    password: { type: String, required: true }
})
const People = mongoose.model('peoples', peoplesschema)

app.get('/',(request,response)=>{
    response.json('welcome.....')
})
app.post('/register', async (request, response) => {
    try {
        const { name, email, password } = request.body
        const existingUser = await People.findOne({ email })
        if (existingUser) {
            return response.status(400).json({ message: 'person arleady exist' })

        }
        const hashedpassword= await bcrypt.hash(password,10)
        const user= new People({name,email,password:hashedpassword})
        await user.save()
        response.status(200).json({message:'people added',user })
    }
    catch(error){
        response.status(500).json({message:'can not add people'})
    }
})

app.post('/login',async(request,response)=>{
    try{
        const{email,password}=request.body
        const user= await People.findone({email})
        if(!user){
            return response.status(400).json({message:'wrong email'})
        }
        const ismatch =await bcrypt.compare(password,user.password)
        if(!ismatch){
            return response.status(400).json({message:'invalid password'})
        }
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'2d'})

        response.json({
            token,
            user:{id:user._id,name:user.name,email:user.email}
        });

    }
    catch(error){
        response.status(500).json({message:'error in loggingin',error})
    }
})
app.get('/peoples',async(request,response)=>{
    try{
        const data=await People.find()
        response.status(200).json({message:'people found',data})
    }
    catch(error){
        response.status(500).json({message:'cannot find people',error})
    }
})
app.post('/peoples',async(request,response)=>{
    try{
        const{name,email,password}=request.body
        
        const data= People({name,email,password})
        await data.save()
        response.status(200).json({message:'people created',data})
    }
    catch(error){
        response.status(500).json({message:'cannot create people',error})
    }
})
app.put('/peoples/:id',async(request,response)=>{
    try{
        const id = request.params.id
        const{name,email,password}=request.body
        const data=await People.findByIdAndUpdate(id,{name,email,password})
        response.status(200).json({message:'people updated',data})
    }
    catch(error){
        response.status(500).json({message:'cannot update people',error})
    }

})
app.get('/peoples/:id',async(request,response)=>{
    try{
        const id=request.params.id
        const data=await People.findById(id)
        response.status(200).json({message:'people found',data})

    }
    catch(error){
        response.status(500).json({message:'cannot find people',error})
    }
})
app.delete('/peoples/:id',async(request,response)=>{
    try{
        const id=request.params.id
        const data=await People.findByIdAndDelete(id)
        response.status(200).json({message:'aperson is deleted'})
    }
    catch(error){
        response.status(500).json({message:'cannot delete a person'})

    }
})
const PORT=process.env.PORT
app.listen(PORT, () => console.log(`server is running on port ${PORT}`))

