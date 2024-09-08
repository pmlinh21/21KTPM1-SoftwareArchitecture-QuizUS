import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "../styles/common.css";
import "../styles/input.css";
import { getPlayerById } from '../api/playerApi';

export default function EditUser() {
    const { id } = useParams();
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [facebook, setFacebook] = useState('');
    const [avatar, setAvatar] = useState('');

    useEffect(() => {
        const getData = async () => {
            const data = await getPlayerById(id);

            if (data) {
                setFullname(data.username || '');
                setEmail(data.email || '');
                setPhone(data.phone || '');
                setDob(data.dob || '');
                setGender(data.gender || '');
                setFacebook(data.facebook || '');
                setAvatar(data.avatar);
            }
        }
        getData();
    }, []);

    return(
        <div className='ctn'>
            <div className='brand-logo-ctn'>
                <img src={avatar?.length > 0 ? avatar : '/icons/camera-plus.svg'} alt="brand-logo"  className='user-avatar'/>
                <div className="upload-btn-ctn">
                    <button className="upload-btn"> {/* Button giả */}
                        <img src="/icons/camera-plus.svg" alt="upload-img" />
                        Chọn ảnh
                    </button> 
                    <input type="file" id="file-upload" /> {/* Code backend cho input này nha */}
                </div>
            </div>
            
            <div className='input-ctn'>
                <h6>Thông tin chung</h6>

                {/* Name */}
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="name">Họ tên</label>
                        <input type="text" id="name" placeholder="Họ tên" value={fullname} onChange={(e) => {setFullname(e.target.value)}}/>
                    </div>
                </div>

                {/* Email & Phone */}
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="text" id="email" placeholder="Email" value={email} onChange={(e) => {setEmail(e.target.value)}}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Số điện thoại</label>
                        <input type="text" id="phone" placeholder="Số điện thoại" value={phone} onChange={(e) => {setPhone(e.target.value)}}/>
                    </div>
                </div>

                {/* Birthday & Gender */}
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="birthday">Sinh nhật</label>
                        <input type="text" id="birthday" placeholder="Sinh nhật" value={dob} onChange={(e) => {setDob(e.target.value)}}/>
                    </div>
                    <div className="form-group">
                        <label>Giới tính</label>
                        <div className="radio-group">
                            <label>
                                <input type="radio" name="gender" value="Nam" checked={gender === 'Nam'} onChange={(e) => {setGender(e.target.value)}}/>
                                Nam
                            </label>
                            <label>
                                <input type="radio" name="gender" value="Nữ" checked={gender === 'Nữ'} onChange={(e) => {setGender(e.target.value)}}/>
                                Nữ
                            </label>
                        </div>
                    </div>
                </div>

                {/* Facebook */}
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="website">Facebook</label>
                        <input type="url" id="website" placeholder="Link Facebook" value={facebook} onChange={(e) => {setFacebook(e.target.value)}}/>
                    </div>
                </div>

                {/* Buttons */}
                <div className="button-group">
                    <button className="cancel-btn">Hủy</button>
                    <button className="save-btn">Lưu</button>
                </div>

            </div>
        </div>
    );
}