const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Modelo de Usuario: quien entra en la zona privada de Vagamundo.
const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    // Se guarda el hash, nunca la contraseña en claro. Con select: false no
    // aparece en las consultas salvo que se pida a propósito, así no se
    // escapa en una respuesta por descuido.
    password: { type: String, required: true, select: false },

    rol: { type: String, enum: ["admin", "editor"], default: "editor" },
  },
  { timestamps: true } // añade createdAt y updatedAt automáticamente
);

// Cifra la contraseña antes de guardar. Va aquí y no en el controlador para
// que no haya forma de guardar un usuario con la contraseña en claro.
userSchema.pre("save", async function cifrarPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compara la contraseña escrita en el formulario con el hash guardado.
userSchema.methods.passwordCorrecta = function passwordCorrecta(enClaro) {
  return bcrypt.compare(enClaro, this.password);
};

// Al convertir a JSON cambia _id por id y quita __v y la contraseña, para que
// el frontend no tenga que saber cómo guarda las cosas Mongo.
userSchema.set("toJSON", {
  versionKey: false,
  transform: (documento, salida) => {
    salida.id = salida._id.toString();
    delete salida._id;
    delete salida.password;
  },
});

module.exports = mongoose.model("User", userSchema, "usuarios");
