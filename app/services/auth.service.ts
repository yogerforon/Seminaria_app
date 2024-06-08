import * as bcrypt from "bcrypt"


//import bcrypt from 'bcrypt';
import { Authenticator } from 'remix-auth';
import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { createToken } from '../utils/jwt.server';
import { TokenPayload, LoginForm, RegisterForm, User, ClientInfo } from '~/types';
import { sessionStorage, createSession } from '../services/session.service';
import { findUserByEmail, createUser, generateRandomPassword } from '../models/user.model';

/////////////////////////////// LogIn Function ///////////////////////////////
export async function login(credentials: LoginForm, clientInfo: ClientInfo): Promise<{ token: string, user: TokenPayload } | null> {
  try {
    const { email, password } = credentials;

    // Находим пользователя в базе данных
    const user = await findUserByEmail(email);

    // Проверяем пользователя
    if (!user) {
      throw new Error('User not found');
    }

    // Проверяем пароль
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error('Invalid password');
    }

     // Создаем сессию
     await createSession(user.id, clientInfo.ipAddress, clientInfo.userAgent);

    // Создаем объект TokenPayload для пользователя
    const tokenPayload: TokenPayload = { id: user.id, role: user.role };

     // Обновляем информацию о сессии
     await createSession(user.id, clientInfo.ipAddress, clientInfo.userAgent);

    // Генерируем JWT токен для пользователя
    const token = createToken(tokenPayload);

    if (!token) {
      throw new Error('Failed to generate token');
    }

    return { token, user: tokenPayload };
  } catch (error) {
    console.error('Login failed:', error);
    return null;
  }
}

/////////////////////////////// Registration Function ///////////////////////////////
export async function register(credentials: RegisterForm): Promise<{ token: string; user: TokenPayload } | null> {
  try {
    const { email, password, ipAddress, userAgent } = credentials;

    // Проверяем, существует ли уже пользователь с указанным email
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Создаем нового пользователя в базе данных
    const newUser = await createUser({ email, password, ipAddress, userAgent });

    if (!newUser) {
      throw new Error('Failed to create new user');
    }

    // Создаем JWT токен для нового пользователя
    const tokenPayload: TokenPayload = { id: newUser.id, role: newUser.role };
    const token = createToken(tokenPayload);

    if (!token) {
      throw new Error('Failed to generate token');
    }

    return { token, user: tokenPayload };
  } catch (error) {
    console.error('Registration failed:', error);
    return null;
  }
}

///////////////////////////// Setup Google OAuth Function ///////////////////////////////
export function setupGoogleOAuth() {
  passport.use(new GoogleStrategy({
    clientID: process.env.OAUTH_CLIENT_ID as string,
    clientSecret: process.env.OAUTH_CLIENT_SECRET as string,
    callbackURL: '/google/callback',
  }, async (_accessToken, _refreshToken, profile, done) => {
    try {
      if (!profile.emails || profile.emails.length === 0) {
        console.error('Email not found in Google profile');
        return done(null, false);
      }
      const email = profile.emails[0].value;
      const existingUser = await findUserByEmail(email);

      if (existingUser) {
        // Если пользователь уже существует, вы можете выполнить аутентификацию
        // и создать JWT токен для него
        const tokenPayload: TokenPayload = { id: existingUser.id, role: existingUser.role };
        const token = createToken(tokenPayload);

        return done(null, { token, user: existingUser });
      } else {
        // Если пользователь не существует, вы можете создать нового пользователя в вашей базе данных
        const randomPassword = generateRandomPassword(10);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        const newUser = await createUser({ email, password: hashedPassword });

        if (!newUser) {
          throw new Error('Failed to create new user');
        }

        // После создания нового пользователя, вы можете выполнить аутентификацию
        // и создать JWT токен для него
        const tokenPayload: TokenPayload = { id: newUser.id, role: newUser.role };
        const token = createToken(tokenPayload);

        return done(null, { token, user: newUser });
      }
    } catch (error) {
      return done(error);
    }
  }));
}

//////////////////////////// setupAuthenticator Function ///////////////////////////////
export function setupAuthenticator() {
  const authenticator = new Authenticator(sessionStorage);

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj: User, done) => {
    done(null, obj);
  });

  return authenticator;
}

// import bcrypt from "bcrypt"
// import { Authenticator } from "remix-auth"
// import passport from "passport"
// import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth"

// import { db } from "~/utils/db.server"
// import { createToken } from "~/utils/jwt.server"
// import { TokenPayload, LoginForm, RegisterForm, User } from "~/types"
// import { sessionStorage } from "~/services/session.server"


// /////////////////////////////// LogIn Function ///////////////////////////////
// export async function login(credentials: LoginForm): Promise<{ token: string, user: TokenPayload } | null> {
//   try {
//     const { email, password } = credentials
    
//     // Находим пользователя в базе данных
//     const user = await db.customer.findUnique({ where: { email } })
    
//     // Проверяем пользователя
//     if (!user) {
//       throw new Error('User not found')
//     }

//     // Проверяем пароль
//     const passwordMatch = await bcrypt.compare(password, user.password);
//     if (!passwordMatch) {
//       throw new Error('Invalid password');
//     }


//     // Создаем объект TokenPayload для пользователя
//     const tokenPayload: TokenPayload = { id: user.id, role: user.role }

//     // Генерируем JWT токен для пользователя
//     const token = createToken(tokenPayload)

//     if (!token) {
//        throw new Error('Failed to generate token')
//     }

//     return { token, user: tokenPayload }
//   } catch (error) {
//       console.error('Login failed:', error)
//       return null
//   }
// }

// /////////////////////////////// Registration Function ///////////////////////////////
// export async function register(credentials: RegisterForm): Promise<{ token: string; user: TokenPayload } | null> {
//   try {
//     const { email, password, ipAddress, userAgent,  } = credentials

//     // Проверяем, существует ли уже пользователь с указанным email
//     const existingUser = await db.customer.findUnique({ where: { email } })
//     if (existingUser) {
//       throw new Error('User with this email already exists')
//     }

//     // Хешируем пароль перед сохранением в базу данных
//     const hashedPassword = await bcrypt.hash(password, 10)

//     // Создаем нового пользователя в базе данных
//     const newUser = await db.customer.create({
//       data: {
//         email,
//         password: hashedPassword,
//         role: 'USER', // Здесь можно задать роль по умолчанию для новых пользователей
//         ipAddress,
//         userAgent,
//         loginTime: new Date(),
//         isActive: true,
//         phoneVerified: false,
//       },
//     });

//     // Создаем JWT токен для нового пользователя
//     const tokenPayload: TokenPayload = { id: newUser.id, role: newUser.role };
//     const token = createToken(tokenPayload);

//     if (!token) {
//       throw new Error('Failed to generate token');
//     }

//     return { token, user: tokenPayload };
//   } catch (error) {
//     console.error('Registration failed:', error);
//     return null;
//   }
// }

// //////////////////////////////////////////////////////////////// FinduserByEmail Function ///////////////////////////////
// export async function findUserByEmail(email: string) {
//   try {
//     const user = await db.customer.findUnique({
//       where: {
//         email: email,
//       },
//     });
//     return user;
//   } catch (error) {
//     console.error('Error finding user by email:', error);
//     return null;
//   }
// }

// ///////////////////////////////////////////////////////////// GenerateRandomPassword Function ////////////////////////////
// export function generateRandomPassword(length: number): string {
//   const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//   let password = '';
//   for (let i = 0; i < length; i++) {
//     const randomIndex = Math.floor(Math.random() * charset.length);
//     password += charset[randomIndex];
//   }
//   return password;
// }

// //////////////////////////////////////////////////////// Setup Google OAuth Function ///////////////////////////////
// export function setupGoogleOAuth() {
//   passport.use(new GoogleStrategy({
//     clientID: process.env.OAUTH_CLIENT_ID as string,
//     clientSecret: process.env.OAUTH_CLIENT_SECRET as string,
//     callbackURL: '/auth/google/callback',
//   }, async (_accessToken, _refreshToken, profile, done) => {
//     try {
//       if (!profile.emails || profile.emails.length === 0) {
//         console.error('Email not found in Google profile');
//         return done(null, false);
//       }
//       const email = profile.emails[0].value;
//       const existingUser = await findUserByEmail(email);

//       if (existingUser) {
//         // Если пользователь уже существует, вы можете выполнить аутентификацию
//         // и создать JWT токен для него
//         const tokenPayload: TokenPayload = { id: existingUser.id, role: existingUser.role };
//         const token = createToken(tokenPayload);
        
//         // Передайте токен обратно клиенту или сделайте что-то еще с ним
//         // Например, отправьте его в заголовке ответа
//         return done(null, { token, user: existingUser })
//       } else {
//         // Если пользователь не существует, вы можете создать нового пользователя в вашей базе данных
//         const randomPassword = generateRandomPassword(10)
//         const hashedPassword = await bcrypt.hash(randomPassword, 10)
//         const newUser = await db.customer.create({
//           data: {
//             email: email,
//             password: hashedPassword,
//             // Другие поля профиля, которые вы хотите сохранить в вашей базе данных
//           }
//         });

//         // После создания нового пользователя, вы можете выполнить аутентификацию
//           // и создать JWT токен для него
//           const tokenPayload: TokenPayload = { id: newUser.id, role: newUser.role }
//           const token = createToken(tokenPayload)
        
//         // Передайте токен обратно клиенту или сделайте что-то еще с ним
//         return done(null, { token, user: newUser });
//       }
//     } catch (error) {
//       return done(error);
//     }
//   }));
// }

// //////////////////////////// setupAuthenticator Function ///////////////////////////////
// export function setupAuthenticator() {
//   const authenticator = new Authenticator(sessionStorage);

//   // Настройка серилизации и десериализации пользователя для сессии
//   passport.serializeUser((user, done) => {
//     done(null, user);
//   });

//   passport.deserializeUser((obj: User, done) => {
//     done(null, obj);
//   });

//   return authenticator;
// }

// export async function register({ email, password }: LoginForm) {
//   try {
//     const response = await fetch("/api/register", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//     });

//     if (!response.ok) {
//       throw new Error('Registration failed');
//     }

//     const data = await response.json();
//     return data.customer;
//   } catch (error) {
//     console.error('Error during registration:', error);
//     throw new Error('Registration failed');
//   }
// }
// export async function register({ email, password }: LoginForm) {
//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     return await db.customer.create({
//       data: { email, password: hashedPassword, role: 'USER' },
//     });
//   } catch (error) {
//     console.error('Error during registration:', error);
//     throw new Error('Registration failed');
//   }
// }



// export async function login({ email, password }: LoginForm) {
//   try {
//     const customer = await db.customer.findUnique({ where: { email } })
//     if (!customer) return null
    
//     const isCorrectPassword = await bcrypt.compare(password, customer.password)
//     if (!isCorrectPassword) return null
//     return customer
  
//   } catch (error) {
//     console.error('Error during login:', error)
//     throw new Error('Login failed')
//   }
// }


// export async function createSession(sessionData: Omit<Session, 'id'>): Promise<{ headers: { "Set-Cookie": string } } | null> {
//   try {
//     const response = await fetch("/api/createSession", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(sessionData),
//     });

//     if (!response.ok) {
//       return null;
//     }

//     const data = await response.json();
//     return { headers: { "Set-Cookie": data.setCookie } };
//   } catch (error) {
//     console.error('Error creating session:', error);
//     return null;
//   }
// }
// export async function createSession(sessionData: Omit<Session, 'id'>): Promise<{ headers: { "Set-Cookie": string } } | null> {
//   try {
//     const session = await sessionStorage.getSession();
//     session.set("customerId", sessionData.customerId);
//     await db.session.create({ data: sessionData });
//     return {
//       headers: {
//         "Set-Cookie": await sessionStorage.commitSession(session),
//       },
//     };
//   } catch (error) {
//     console.error('Error creating session:', error);
//     return null;
//   }
// }


export async function getSessionCustomer(request: Request): Promise<{ customerId: number } | null> {
  try {
    const response = await fetch("/api/getSessionCustomer", {
      method: "GET",
      headers: { "Cookie": request.headers.get("Cookie") || "" },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.customerId ? { customerId: data.customerId } : null;
  } catch (error) {
    console.error('Error getting session customer:', error);
    return null;
  }
}

// export async function getSessionCustomer(request: Request): Promise<{ customerId: number } | null> {
//   try {
//     const cookie = request.headers.get("Cookie");
//     const session = await sessionStorage.getSession(cookie);
//     const customerId = session.get("customerId");
//     if (!customerId) return null;
//     const userSession = await db.session.findUnique({
//       where: { id: session.get("id") },
//       include: { customer: true },
//     });
//     if (!userSession) return null;
//     if (userSession.expiresAt && userSession.expiresAt < new Date()) {
//       await db.session.delete({ where: { id: userSession.id } });
//       return null;
//     }
//     return { customerId: userSession.customerId };
//   } catch (error) {
//     console.error('Error getting session customer:', error);
//     return null;
//   }
// }

export async function destroySession(request: Request): Promise<{ headers: { "Set-Cookie": string } }> {
  try {
    const response = await fetch("/api/destroySession", {
      method: "POST",
      headers: { "Cookie": request.headers.get("Cookie") || "" },
    });

    if (!response.ok) {
      return { headers: { "Set-Cookie": "" } };
    }

    const data = await response.json();
    return { headers: { "Set-Cookie": data.setCookie } };
  } catch (error) {
    console.error('Error destroying session:', error);
    return { headers: { "Set-Cookie": "" } };
  }
}
// export async function destroySession(request: Request): Promise<{ headers: { "Set-Cookie": string } }> {
//   try {
//     const cookie = request.headers.get("Cookie");
//     const session = await sessionStorage.getSession(cookie);
//     const customerId = session.get("customerId");
//     if (customerId) {
//       await db.session.updateMany({
//         where: { customerId, isActive: true },
//         data: { isActive: false, logoutTime: new Date() },
//       });
//     }
//     return {
//       headers: {
//         "Set-Cookie": await sessionStorage.destroySession(session),
//       },
//     };
//   } catch (error) {
//     console.error('Error destroying session:', error);
//     return {
//       headers: {
//         "Set-Cookie": "",
//       },
//     };
//   }
// }
