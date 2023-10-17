const { request, response } = require("express");
const { findTipekamar } = require("./tipe_kamar.controller");
const kamarModel = require("../models/index").kamar;
const tipeKamarModel = require("../models/index").tipe_kamar;
const Op = require("sequelize").Op;
const Sequelize = require("sequelize");
const sequelize = new Sequelize("wikuhotel", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

exports.getAllKamar = async (request, response) => {
  let kamars = await kamarModel.findAll({
    include: {
      model: tipeKamarModel,
      attributes: ['nama_tipe_kamar']
    },
    order: [['createdAt', 'DESC']]
  });
  return response.json({
    success: true,
    data: kamars,
    message: "All rooms have been loaded",
  });
};

exports.findKamar = async (request, response) => {
  let keyword = request.body.keyword;
  let kamars = await kamarModel.findAll({ 
    where: {
      [Op.or]: [
        // { id: { [Op.substring]: keyword } },
        { nomor_kamar: {[Op.substring]: keyword} },
      ],
    },
    include: {
      model: tipeKamarModel,
      attributes: ['nama_tipe_kamar']
    },
    order:[['createdAt', 'DESC']]
  });
  return response.json({
    success: true,
    data: kamars,
    message: "All rooms have been loaded",
  });
};

exports.addKamar = async (request, response) => {
  let nama_tipe_kamar = request.body.nama_tipe_kamar;
  let tipeId = await tipeKamarModel.findOne({
    where: {
      [Op.and]: [{ nama_tipe_kamar: { [Op.substring]: nama_tipe_kamar } }],
    },
  });
  console.log(tipeId);

  if (tipeId === null) {
    return response.json({
      success: false,
      message: `Tipe kamar yang anda inputkan tidak ada`,
    });
  } else {
    let newRoom = {
      nomor_kamar: request.body.nomor_kamar,
      tipeKamarId: tipeId.id,
    };

    if (newRoom.nomor_kamar === "" || nama_tipe_kamar === "") {
      return response.json({
        success: false,
        message: `Mohon diisi semua`,
      });
    }

    let kamars = await kamarModel.findAll({
      where: {
        [Op.and]: [
          { nomor_kamar: newRoom.nomor_kamar },
          { tipeKamarId: newRoom.tipeKamarId },
        ],
      },
      attributes: ["id", "nomor_kamar", "tipeKamarId"],
    });
    if (kamars.length > 0) {
      return response.json({
        success: false,
        message: `Kamar yang anda inputkan sudah ada`,
      });
    }
    kamarModel
      .create(newRoom)
      .then((result) => {
        return response.json({
          success: true,
          data: result,
          message: `New Room has been inserted`,
        });
      })
      .catch((error) => {
        return response.json({
          success: false,
          message: error.message,
        });
      });
  }
};

exports.updateKamar = async (request, response) => {
  let dataKamar = {
    nomor_kamar: request.body.nomor_kamar,
    tipeKamarId: request.body.tipeKamarId,
  };
  let id = request.params.id;
  kamarModel
    .update(dataKamar, { where: { id: id } })
    .then((result) => {
      return response.json({
        success: true,
        message: `Data room has been updated`,
      });
    })
    .catch((error) => {
      return response.json({
        success: false,
        message: error.message,
      });
    });
};

exports.deleteKamar = (request, response) => {
  let id = request.params.id;
  kamarModel
    .destroy({ where: { id: id } })
    .then((result) => {
      return response.json({
        success: true,
        message: `Data room has been updated`,
      });
    })
    .catch((error) => {
      return response.json({
        success: false,
        message: error.message,
      });
    });
};

exports.availableRoom = async (request, response) => {
  const tgl_check_in = request.body.tgl_check_in;
  const tgl_check_out = request.body.tgl_check_out;

  const result = await sequelize.query(
    `SELECT DISTINCT tipe_kamars.* FROM tipe_kamars LEFT JOIN kamars ON tipe_kamars.id = kamars.tipeKamarId WHERE tipe_kamars.id IN (SELECT kamars.tipeKamarId FROM kamars LEFT JOIN tipe_kamars ON kamars.tipeKamarId = tipe_kamars.id LEFT JOIN detail_pemesanans ON detail_pemesanans.kamarId = kamars.id WHERE kamars.id NOT IN (SELECT kamarId from detail_pemesanans WHERE tgl_akses BETWEEN '${tgl_check_in}' AND '${tgl_check_out}') GROUP BY kamars.nomor_kamar);`
  );

  return response.json({
    success: true,
    sisa_kamar: result[0].length,
    data: result[0],
    message: `Room have been loaded`,
  });
};