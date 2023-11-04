import local from 'passport-local';
import passport from 'passport';
import { createHash, validatePassword } from '../utils/bcrypt.js';
import {userModel} from '../models/user.modeles.js'

const LocalStrategy = local.Strategy;
const initializazPassport = () => {

    passport.use('register', new LocalStrategy(
        {passReqToCallback: true, usernameField: 'email'}, async (req, username, password, done) => {
            //Registro de usuario
            const {first_name, last_name, email, age} =req.body;

            try{
                const user = await userModel.findOne({ email: email })

                if(user){
                    //Caso error: usuario existe
                    return  done(null, false);
                }
                //Crear usuario
                const passwordHash = createHash(password);
                const userCreated = await userModel.create({
                    first_name: first_name,
                    last_name: last_name,
                    age: age,
                    email: email,
                    password: passwordHash
                });

                return done(null, userCreated);

            } catch(error){
                return done(error);
            }
        }));
        
        passport.use('login',new LocalStrategy(
            {usernameField: 'email'}, async(username, password, done) => {
                try{
                    const user = await userModel.findOne({email: username});

                    if(!user){
                        return done(null, false)
                    }
                    
                    if(validatePassword(password, user.password)){
                        return done(null, user)
                    }

                    const userForSession = { ...user.toObject(), password: undefined };  // Eliminamos la contraseña por seguridad
                    return done(null, userForSession);  // Pasamos el usuario a la sesión sin la contraseña

                } catch (error) {
                    return done(error)  
                }
            }))
            //inicializar la session del user
            passport.serializeUser((user, done) => {
                done(null, user._id)
            });

            
            //Eliminar las session
            passport.deserializeUser(async (id, done) => {
                try {
                    const user = await userModel.findById(id).lean();  // Usamos .lean() para obtener un objeto simple
                    done(null, user);  // El objeto de usuario se añadirá a req.user
                } catch (error) {
                    done(error, null);
                }
            });
}
export default initializazPassport