const tipe_kamarModel = require(`../models/index`).tipe_kamar
//const { path } = require("../routes/tipe_kamar.route")
const Op = require(`sequelize`).Op

const path = require("path")
const fs = require("fs")

const md5 = require(`md5`)
const upload = require("./upload.tipe_kamar").single('foto')
//let password = md5(`password`)

exports.getAllTipe_kamar = async (request, response) => {
    let tipe_kamars = await tipe_kamarModel.findAll()
    return response.json({
        success: true,
        data: tipe_kamars,
        message: `All Tipe_kamars have been loaded`
    })
}
/** create function for filter */
exports.findTipe_kamar = async (request, response) => {
    let keyword= request.body.keyword
    let tipe_kamars = await tipe_kamarModel.findAll({
        where: {
            [Op.or]: [
                { nama_tipe_kamar: { [Op.substring]: keyword } },
                { harga: { [Op.substring]: keyword } },
                { deskripsi: { [Op.substring]: keyword } },
                { foto: { [Op.substring]: keyword } },
            ]
        }
    })
    return response.json({
        success: true,
        data: tipe_kamars,
        message: `All Tipe_kamars have been loaded`
    })
}
exports.addTipe_kamar= async (request, response) => {
    /** run function upload */
    upload(request, response, async (error) => {
      /** check if there are errorwhen upload */
      if (error) {
        console.log("err");
        return response.json({ message: error });
      }
      /** check if file is empty */
      if (!request.file) {
        return response.json({ message: `Nothing file to Upload` });
      }
      /** prepare data from request */
      let newTipe_kamar = {
        nama_tipe_kamar: request.body.nama_tipe_kamar,
        harga: request.body.harga,
        deskripsi: request.body.deskripsi,
        foto: request.file.filename
      };
      console.log(newTipe_kamar);
      tipe_kamarModel
        .create(newTipe_kamar)
        .then((result) => {
          return response.json({
            success: true,
            data: result,
            message: `New tipe_kamar has been inserted`,
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
  
  exports.updateTipe_kamar = async (request, response) => {
    upload(request, response, async (err) => {
      if (err) {
        return response.json({ message: err });
      }
      let id = request.params.id;
      let dataTipe_kamar = {
        nama_tipe_kamar: request.body.nama_tipe_kamar,
        harga: request.body.harga,
        deskripsi: request.body.deskripsi,
        foto: request.file.filename,
      };
      console.log(dataTipe_kamar);
  
      if (request.file) {
        /** get selected book's data */
        const selectedTipe_kamar = await tipe_kamarModel.findOne({
          where: { id: id },
        });
        const oldFotoTipe_kamar = selectedTipe_kamar.foto;
  
        const pathImage = path.join(__dirname, `/../foto`, oldFotoTipe_kamar);
        if (fs.existsSync(pathImage)) {
          fs.unlink(pathImage, (error) => console.log(error));
        }
        dataTipe_kamar.foto = request.file.filename;
      }
      /** execute update data based on defined id book */
      tipe_kamarModel
        .update(dataTipe_kamar, { where: { id: id } })
        .then((result) => {
          return response.json({
            success: true,
            message: `Data tipe_kamar has been updated`,
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

exports.deleteTipe_kamar = (request, response) => {
    /** define id tipe_kamar that will be update */
    let idTipe_kamar = request.params.id
    /** execute delete data based on defined id member */
    tipe_kamarModel.destroy({ where: { id: idTipe_kamar } })
        .then(result => {
            /** if update's process success */
            return response.json({
                success: true,
                message: `Data tipe_kamar has been deleted`
            })
        })
        .catch(error => {
            /** if update's process fail */
            return response.json({
                success: false,
                message: error.message
            })
        })
}


