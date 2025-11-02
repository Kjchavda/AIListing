import { SignIn, SignUp } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";

import React from "react";

const SignInPage = () => {
  return (
    <div className="">
      <section className="flex justify-center items-center min-h-screen">

        <SignIn
          appearance={{
            baseTheme: dark,
            elements: {
            formButtonPrimary: "px-6 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#370361] to-[#0b8793] hover:opacity-90 transition-opacity",
            socialButtonsBlockButton:"px-6 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#370361] to-[#0b8793] hover:opacity-90 transition-opacity",
            formFieldInput: "bg-card/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent",
            dividerText: "text-muted-foreground px-3",
          }
          }}
          signUpUrl={"/sign-up"}
        />
      </section>
    </div>
  );
};

export default SignInPage;
