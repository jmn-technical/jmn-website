// // api/auth/login.js
// import cookies from "js-cookie";


// export default async (req,res)=>{
//     const {method} = req;
//     switch (method) {
//         case 'GET':
//             try {
//                 const contact = await Auth.find()
//                 res.status(200).json({success:true,data:contact})
//             } catch (error) {
//                 res.status(400).json({success:false, error:error.message})
               
//             }
//             break

//         case 'POST':
//             try {
//                 const body= await req.body   ;
        
//                 const { username, password,serverUsername,serverPassword } = body;
               
//                 const isAuthenticated = await authenticateAdmin(username, password,serverUsername,serverPassword);
                
//                 if(isAuthenticated){
//                     cookies.set("admin",true)
//                     console.log(cookies.get('admin'),'dfdfdfdf')  
//                     const response = res.json({message: "Welcome!"})
             
//                   console.log("itsss>>>> okk")
//                   return response
//                 }
//               } catch (error) {
//                 console.log(error)
//             }  
//             break
            
            
//             default :
//             res.status(200).json({status:false})
            
//     }
// }
 

 


// async function authenticateAdmin(username, password,serverUsername,serverPassword) {
 
//   if (
//     username === serverUsername &&
//     password === serverPassword
//   ) {
//     return true;
//   }
// }


// pages/api/auth/login.js
const Auth = require("../../../models/Auth");

export default async function handler(req, res) {
  const { method } = req;

  if (method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ success: false, error: `Method ${method} Not Allowed` });
  }

  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Username and password required" });
    }

    const user = await Auth.findOne({ username });

    if (!user || user.password !== password) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid username or password" });
    }

    return res.status(200).json({
      success: true,
      message: "Welcome!",
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ success: false, error: error.message });
  }
}
