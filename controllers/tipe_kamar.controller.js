const { request, response } = require("express");
const express = require("express");
const app = express();

const tipeModel = require(`../models/index`).tipe_kamar;
const Op = require(`sequelize`).Op;

const path = require(`path`);
const fs = require(`fs`);

const upload = require(`./uploadTipekamar`).single(`foto`);

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//mendaptkan semua data dalam tabel
exports.getAllType = async (request, response) => {
  let tipe = await tipeModel.findAll({
    order:[['createdAt', 'DESC']],}
  );
  return response.json({
    success: true,
    data: tipe,
    message: `All room have been loaded`,
  });
};

//mendaptkan salah satu data dalam tabel (where clause)
exports.findType = async (request, response) => {
  let keyword = request.body.keyword
    let tipe_kamars = await tipeModel.findAll({
        where: {
            [Op.or]: [
                { nama_tipe_kamar: { [Op.substring]: keyword } },
                { harga: { [Op.substring]: keyword } }
            ]
        },
        order: [['createdAt', 'DESC']]
    })
    return response.json({
        success: true,
        data: tipe_kamars,
        message: "berikut data yang anda minta yang mulia"
    })
};

//menambah data
exports.addType = (request, response) => {
  upload(request, response, async (error) => {
    if (error) {
      return response.json({ message: error });
    }

    if (!request.file) {
      return response.json({ message: `Nothing to upload` });
    }

    let newType = {
      nama_tipe_kamar: request.body.nama_tipe_kamar,
      harga: request.body.harga,
      deskripsi: request.body.deskripsi,
      foto: request.file.filename,
    };

    console.log(newType);

    tipeModel
      .create(newType)
      .then((result) => {
        return response.json({
          success: true,
          data: result,
          message: `New Type Room has been inserted`,
        });
      })
      .catch((error) => {
        return response.json({
          success: false,
          message: error.message,
        });
      });
  });
};

//mengupdate salah satu data
exports.updateType = (request, response) => {
  upload(request, response, async (error) => {
    if (error) {
      return response.json({ message: error });
    }

    let idType = request.params.id;

    let dataType = {
      nama_tipe_kamar: request.body.nama_tipe_kamar,
      harga: request.body.harga,
      deskripsi: request.body.deskripsi,
      // foto: request.file.filename,
    };
    if (request.file && request.file.filename) {
      dataType.foto = request.file.filename;
    }

    if (request.file) {
      const selectedUser = await tipeModel.findOne({
        where: { id: idType },
      });

      const oldFotoUser = selectedUser.foto;

      const patchFoto = path.join(__dirname, `../foto_tipe_kamar`, oldFotoUser);

      if (fs.existsSync(patchFoto)) {
        fs.unlink(patchFoto, (error) => console.log(error));
      }
      dataType.foto = request.file.filename;
    }

    tipeModel
      .update(dataType, { where: { id: idType } })
      .then((result) => {
        return response.json({
          success: true,
          message: `Data room type has been update`,
        });
      })
      .catch((error) => {
        return response.json({
          success: false,
          message: error.message,
        });
      });
  });
};

//mengahapus salah satu data
exports.deleteType = (request, response) => {
  let idType = request.params.id;

  tipeModel
    .destroy({ where: { id: idType } })
    .then((result) => {
      return response.json({
        success: true,
        message: `data room type has ben delete`,
      });
    })
    .catch((error) => {
      return response.json({
        success: false,
        message: error.message,
      });
    });
};

//get available room
exports.getAvailable = async (request,response)=>{
  let check_in=request.body.check_in
  let check_out=request.body.check_out

  const result = await sequelize.query(
    `SELECT tipe_kamars.nama_tipe_kamar FROM kamars LEFT JOIN tipe_kamars ON kamars.id_tipe_kamar = tipe_kamars.id LEFT JOIN detail_pemesanans ON detail_pemesanans.id_kamar = kamars.id WHERE tipe_kamars.id NOT IN (SELECT id_tipe_kamar from pemesanans JOIN detail_pemesanans on detail_pemesanans.id_pemesanan=pemesanans.id WHERE tgl_akses BETWEEN '${check_in}' AND '${check_out}') GROUP BY tipe_kamars.nama_tipe_kamar ORDER BY tipe_kamars.id DESC`
  );
  
  if (result[0].length === 0) {
    return response.json({
      success: false,
      data: `nothing type room available`,
    });
  }
  response.json({
    success: true,
    data: result[0],
    message: `All Transaction have been loaded`,
  });
}