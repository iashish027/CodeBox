import SignUpForm from "./SignUpForm";

export default function SignUp() {
  return (
    <div className="SignUpPage mt-8 flex flex-col items-center">
      <p className="font-bold mb-4">
        Fill in the form to register in CodeBox
      </p>

      <div className="SignUpBox border rounded-2xl w-full max-w-[500px]">
        <p className="border-b border-gray-300 p-3 font-semibold">
          Register in CodeBox
        </p>

        <SignUpForm />
      </div>
    </div>
  );
}
