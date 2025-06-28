post api/user/savings
get api/user/savings (return all user savings plan)
get api/user/saving/{idSavings}
patch api/user/saving/{idSavings}
delete api/user/saving/{idSavings}

    // Verify and decrypt the token
    if (!verifyToken(userToken)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
