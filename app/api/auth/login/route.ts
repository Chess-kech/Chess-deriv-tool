import { NextResponse } from "next/server"

// Define the valid username and password combinations securely on the server
const VALID_CREDENTIALS = [
  { username: "eric", password: "Key" },
  { username: "dataPilot2", password: "kitur1" },
  { username: "dea", password: "tradeMaster!456" },
  { username: "dot", password: "ravii" },
  { username: "mosa", password: "moha1" },
]

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Username and password are required." }, { status: 400 })
    }

    const isValid = VALID_CREDENTIALS.some((cred) => cred.username === username && cred.password === password)

    if (isValid) {
      // In a real application, you would generate a JWT or session token here
      return NextResponse.json({ success: true, message: "Login successful!" }, { status: 200 })
    } else {
      return NextResponse.json({ success: false, message: "Invalid username or password." }, { status: 401 })
    }
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ success: false, message: "An unexpected error occurred." }, { status: 500 })
  }
}
