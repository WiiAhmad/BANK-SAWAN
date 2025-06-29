post api/user/savings
create savings plan
  title       String
  goalAmount  Decimal
  description String?
  targetDate  DateTime

get api/user/savings (return all user savings plan)

patch api/user/saving/{idSavings}
delete api/user/saving/{idSavings}

    // Verify and decrypt the token
    if (!verifyToken(userToken)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
