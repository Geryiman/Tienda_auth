
import express, { application, Request, Response} from "express";
import dortenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { allowedNodeEnvironmentFlags } from "node:process";
import { time, timeStamp } from "node:console";



import authRoutes from './routes/auth.routes';
import productRoutes from "./routes/product.routes";

dortenv.config();

const app: express.Application = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
app.use(express.json({limit: '10kb'}));

app.get("/", (req: Request, res: Response) => {
    res.status(200).send("Auth API is running GYMB is here").json({
        status: "success",
        message: "Auth API is running GYMB is here",
        timeStamp: new Date()
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});