import { useState } from "react";

const formFields = [
  { id: "handle", label: "Handle", type: "text" },
  { id: "email", label: "Email", type: "email" },
  { id: "password", label: "Password", type: "password" },
];

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    handle: "",
    email: "",
    password: "",
  });

  function handleChange(e) {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Form Data:", formData);
    // TODO: validation + API call
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-5"
    >
      {formFields.map(({ id, label, type }) => (
        <div key={id} className="flex flex-col">
          <label
            htmlFor={id}
            className="text-sm font-medium mb-1"
          >
            {label}
          </label>

          <input
            id={id}
            type={type}
            value={formData[id]}
            onChange={handleChange}
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      ))}

      <button
        type="submit"
        className="mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Register
      </button>
    </form>
  );
}
