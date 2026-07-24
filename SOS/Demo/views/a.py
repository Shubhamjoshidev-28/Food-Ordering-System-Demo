while True:
    user_input = input("Enter a number or type 'exit': ")

    if user_input.lower() == "exit":
        print("Loop ended")
        break

    user_input = int(user_input)

    if user_input < 0:
        print("Negative")
    elif user_input > 0:
        print("Positive")
    else:
        print("Zero")