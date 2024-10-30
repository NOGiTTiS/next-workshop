"use client";

import { useEffect, useState } from "react";
import MyModal from "../components/MyModal";
import Swal from "sweetalert2";
import axios from "axios";
import config from "@/app/config";

export default function Page() {
  const [foodTypeId, setFoodTypeID] = useState(0);
  const [foodTypes, setFoodTypes] = useState([]);
  const [foods, setFoods] = useState([]);
  const [name, setName] = useState("");
  const [remark, setRemark] = useState("");
  const [id, setId] = useState(0);
  const [price, setPrice] = useState(0);
  const [img, setImg] = useState("");
  const [myFile, setMyFile] = useState<File | null>(null);
  const [foodType, setFoodType] = useState("food");

  useEffect((): void => {
    fetchDataFoodType();
    fetchData();
  }, []);

  const fetchDataFoodType = async () => {
    try {
      const res = await axios.get(config.apiServer + "/api/foodType/list");

      if (res.data.results.length > 0) {
        setFoodTypes(res.data.results);
        setFoodTypeID(res.data.results[0].id);
      }
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const fetchData = async (): Promise<void> => {
    try {
      const res = await axios.get(config.apiServer + "/api/food/list");
      setFoods(res.data.results);
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const handleSelectedFile = (e: any) => {
    if (e.target.files.length > 0) {
      setMyFile(e.target.files[0]);
    }
  };

  const handleSave = async (): Promise<void> => {
    try {
      const img = await handleUpload();
      const payload = {
        foodTypeId: foodTypeId,
        name: name,
        remark: remark,
        price: price,
        img: img,
        id: id,
        foodType: foodType,
      };

      if (id == 0) {
        await axios.post(config.apiServer + "/api/food/create", payload);
      } else {
        await axios.put(config.apiServer + "/api/food/update", payload);
        setId(0);
      }

      Swal.fire({
        title: "บันทึกข้อมูล",
        text: "บันทึกข้อมูลสำเร็จ",
        icon: "success",
        timer: 1000,
      });

      fetchData();
      document.getElementById("modalFood_btnClose")?.click();
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const handleUpload = async (): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("myFile", myFile);

      const res = await axios.post(
        config.apiServer + "/api/food/upload",
        formData
      );
      return res.data.fileName;
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const getFoodTypeName = (foodType: string): string => {
    if (foodType == "food") {
      return "อาหาร";
    } else {
      return "เครื่องดื่ม";
    }
  };

  const handleRemove = async (id: number) => {
    try {
      const button = await Swal.fire({
        title: "ยืนยันการลบ",
        text: "คุณต้องการลบใช่หรือไม่",
        icon: "question",
        showCancelButton: true,
        showConfirmButton: true,
      });

      if (button.isConfirmed) {
        await axios.delete(config.apiServer + "/api/food/remove/" + id);
        fetchData();
      }
    } catch (e: any) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const handleEdit = (item: any) => {
    setId(item.id);
    setFoodTypeID(item.foodTypeId);
    setName(item.name);
    setRemark(item.remark);
    setPrice(item.price);
    setFoodType(item.foodType);
    setImg(item.img);
  };

  const handleClearForm = () => {
    setId(0);
    setName("");
    setRemark("");
    setPrice(0);
    setFoodType("food");
    setImg("");
    (document.getElementById("myFile") as HTMLInputElement).value = "";
  };

  return (
    <>
      <div className="card mt-3">
        <div className="card-header">อาหาร</div>
        <div className="card-body">
          <button
            className="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#modalFood"
            onClick={handleClearForm}>
            <i className="fa fa-plus me-2"></i>เพิ่มรายการ
          </button>

          <table className="mt-3 table table-bordered table-striped">
            <thead>
              <tr>
                <th style={{ width: "100px" }}>ภาพ</th>
                <th style={{ width: "200px" }}>ประเภท</th>
                <th style={{ width: "100px" }}>ชนิด</th>
                <th style={{ width: "200px" }}>ชื่อ</th>
                <th>หมายเหตุ</th>
                <th style={{ width: "100px" }} className="text-end">
                  ราคา
                </th>
                <th style={{ width: "110px" }}></th>
              </tr>
            </thead>
            <tbody>
              {foods.map((item: any) => (
                <tr key={item.id}>
                  <td>
                    <img
                      src={config.apiServer + "/uploads/" + item.img}
                      alt={item.name}
                      width="50"
                    />
                  </td>
                  <td>{item.FoodType.name}</td>
                  <td>{getFoodTypeName(item.foodType)}</td>
                  <td>{item.name}</td>
                  <td>{item.remark}</td>
                  <td className="text-end">{item.price}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-primary me-2"
                      data-bs-toggle="modal"
                      data-bs-target="#modalFood"
                      onClick={(e) => handleEdit(item)}>
                      <i className="fa fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={(e) => handleRemove(item.id)}>
                      <i className="fa fa-times"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <MyModal id="modalFood" title="อาหาร">
        <div>ประเภทอาหาร</div>
        <select
          className="form-control"
          value={foodTypeId}
          onChange={(e) => setFoodTypeID(parseInt(e.target.value))}>
          {foodTypes.map((item: any) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <div className="mt-3">ภาพ</div>
        {img != "" && (
          <img
            className="mb-2 img-fluid"
            src={config.apiServer + "/uploads/" + img}
            alt={name}
            width="100"
          />
        )}
        <input
          type="file"
          id="myFile"
          className="form-control"
          onChange={(e) => handleSelectedFile(e)}
        />

        <div className="mt-3">ชื่อ</div>
        <input
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="mt-3">หมายเหตุ</div>
        <input
          className="form-control"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
        />

        <div className="mt-3">ราคา</div>
        <input
          className="form-control"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
        />

        <div className="mt-3">ประเภภทอาหาร</div>
        <div className="mt-1">
          <input
            type="radio"
            name="foodType"
            value="food"
            checked={foodType === "food"}
            onChange={(e) => setFoodType(e.target.value)}
          />
          อาหาร
          <input
            type="radio"
            className="ms-3"
            name="foodType"
            value="drink"
            checked={foodType === "drink"}
            onChange={(e) => setFoodType(e.target.value)}
          />
          เครื่องดื่ม
        </div>

        <button className="mt-3 btn btn-primary" onClick={handleSave}>
          <i className="fa fa-check me-2"></i>บันทึก
        </button>
      </MyModal>
    </>
  );
}
