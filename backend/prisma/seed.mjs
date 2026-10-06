import pg from 'pg'; import { randomUUID } from 'crypto';
const { Client } = pg; const db=new Client({connectionString:process.env.DATABASE_URL}); await db.connect();
const verified='2026-10-05T00:00:00+07:00';
const services=[
{code:'STUDENT_LEAVE_15_DAYS',title:'ลานักศึกษา (ไม่เกิน 15 วัน)',description:'คู่มือเตรียมแบบใบลานักศึกษาไม่เกิน 15 วัน ของคณะวิทยาศาสตร์ มหาวิทยาลัยแม่โจ้',docs:[],steps:[['กรอกแบบใบลา','ระบุเรื่อง ผู้รับ ชื่อ-นามสกุล สาขาวิชา ชั้นปี รหัสนักศึกษา จำนวนวันลา ช่วงวันที่ เหตุผล และที่พักระหว่างลา',true,null],['ลงชื่อนักศึกษา','นักศึกษาลงชื่อรับรองคำขอ',true,null],['เสนออาจารย์ที่ปรึกษา','ส่วนคำสั่งสำหรับอาจารย์ที่ปรึกษา',true,null],['แจ้งอาจารย์ประจำวิชา','แบบฟอร์มมีส่วนรับทราบของอาจารย์ประจำวิชา',true,null]],links:[['ดาวน์โหลดแบบใบลานักศึกษา','https://secretary-science.mju.ac.th/goverment/25570522101243_science_secretary/Doc_25660719100350_554763.pdf','FORM']]},
{code:'RESIGNATION',title:'ขอลาออกจากการเป็นนักศึกษา',description:'คำร้องขอลาออก มจท. 21 พร้อมคำรับรองของผู้ปกครอง',docs:[['ใบยินยอมขอลาออกจากผู้ปกครอง','เอกสารระบุให้แนบพร้อมคำร้อง',true]],steps:[['กรอกและลงนามคำร้อง','กรอกข้อมูลนักศึกษา เหตุผล และลงชื่อนักศึกษา',true,null],['อาจารย์ที่ปรึกษารับทราบ','เสนอความเห็นอาจารย์ที่ปรึกษา',true,null],['ประธานหลักสูตรรับทราบ','เสนอประธานอาจารย์ประจำหลักสูตร',true,null],['คณบดีรับทราบ','เสนอความเห็นคณบดี',true,null],['สำนักบริหารและพัฒนาวิชาการ','เสนอผู้อำนวยการสำนักบริหารและพัฒนาวิชาการ',true,'สำนักบริหารและพัฒนาวิชาการ'],['อธิการบดีพิจารณา','อธิการบดีอนุมัติหรือไม่อนุมัติ',true,null],['ทะเบียนบันทึกข้อมูล','คำร้องสิ้นสุดที่กลุ่มภารกิจทะเบียนเรียนฯ เพื่อบันทึกฐานข้อมูล',true,'ชั้น 2 อาคารอำนวย ยศสุข']],links:[['ดาวน์โหลดคำร้องขอลาออก มจท. 21','https://edu.mju.ac.th/www/ViewFile.ashx?f=MTgucGRm0','FORM']]},
{code:'TRANSFER_WITHIN_FACULTY',title:'โอนย้ายสาขาวิชาภายในคณะ',description:'คำร้องขอโอนย้ายสาขาวิชาภายในคณะ มจท. 15',docs:[['ใบรายงานผลการศึกษา','ระบุในหัวข้อสิ่งที่ส่งมาด้วย',true]],steps:[['ตรวจคุณสมบัติและกรอกคำร้อง','ตรวจคุณสมบัติตามหลักสูตรและกรอกข้อมูลการขอโอนย้าย',true,null],['ขอความเห็นสาขาเดิม','อาจารย์ที่ปรึกษาและประธานอาจารย์ผู้รับผิดชอบหลักสูตรพิจารณา',true,null],['ขอความเห็นสาขาใหม่','ประธานอาจารย์ผู้รับผิดชอบหลักสูตรและคณบดีพิจารณา',true,null],['ชำระค่าธรรมเนียม','ชำระค่าธรรมเนียมโอนย้ายสาขา/คณะ',false,'งานเงินรายได้ กองคลัง ชั้น 1 สำนักงานมหาวิทยาลัย'],['ยื่นคำร้อง','ยื่นคำร้องที่ฝ่ายทะเบียนและบริการการศึกษา',false,'ฝ่ายทะเบียนและบริการการศึกษา'],['เจ้าหน้าที่ดำเนินการ','เจ้าหน้าที่ดำเนินการย้ายสาขาวิชาและระบุรหัสนักศึกษาใหม่',true,null]],links:[['ดาวน์โหลดคำร้อง มจท. 15','https://edu.mju.ac.th/www/ViewFile.ashx?f=MTQucGRm0','FORM']]},
{code:'TRANSFER_BETWEEN_FACULTIES',title:'โอนย้ายสาขาวิชาต่างคณะ',description:'คำร้องขอโอนย้ายสาขาวิชาต่างคณะ มจท. 16',docs:[['ใบรายงานผลการศึกษา','ระบุในหัวข้อสิ่งที่ส่งมาด้วย',true]],steps:[['ตรวจคุณสมบัติและกรอกคำร้อง','ตรวจคุณสมบัติตามหลักสูตรและกรอกข้อมูลการขอโอนย้าย',true,null],['ขอความเห็นสาขา/คณะเดิม','อาจารย์ที่ปรึกษา ประธานหลักสูตร และคณบดีคณะเดิมพิจารณา',true,null],['ขอความเห็นสาขา/คณะใหม่','ประธานหลักสูตรและคณบดีคณะใหม่พิจารณา',true,null],['ชำระค่าธรรมเนียม','ชำระค่าธรรมเนียมโอนย้ายสาขา/คณะ',false,'งานเงินรายได้ กองคลัง ชั้น 1 สำนักงานมหาวิทยาลัย'],['ยื่นคำร้อง','คำร้องที่อนุมัติแล้วต้องยื่นก่อนเปิดภาคเรียนปกติที่ขอโอนย้ายไม่น้อยกว่า 4 สัปดาห์',false,'ฝ่ายทะเบียนและบริการการศึกษา สำนักบริหารและพัฒนาวิชาการ'],['เจ้าหน้าที่ดำเนินการ','เจ้าหน้าที่ดำเนินการย้ายสาขาวิชาและระบุรหัสนักศึกษาใหม่',true,null]],links:[['ดาวน์โหลดคำร้อง มจท. 16','https://edu.mju.ac.th/www/ViewFile.ashx?f=MTUucGRm0','FORM']]},
{code:'GRADE_V',title:'ลงทะเบียนเพื่อให้ได้ค่าระดับคะแนน V',description:'คำร้องขอลงทะเบียนเพื่อให้ได้ค่าระดับคะแนนเป็น V (Visitor) มจท. 17',docs:[['สำเนาคำร้องสำหรับอาจารย์ผู้สอน','หลังดำเนินการให้นำสำเนาให้อาจารย์ผู้สอน 1 ฉบับ',true],['สำเนาสำหรับนักศึกษา','นักศึกษาเก็บไว้ 1 ฉบับ',true]],steps:[['กรอกและลงนามคำร้อง','ระบุภาคการศึกษา รายวิชา หน่วยกิต และข้อมูลนักศึกษา',true,null],['อาจารย์ที่ปรึกษาพิจารณา','ขอความเห็นอาจารย์ที่ปรึกษา',true,null],['อาจารย์ผู้สอนพิจารณา','ขอความเห็นอาจารย์ผู้สอน',true,null],['ฝ่ายทะเบียนพิจารณา','ขอความเห็นหัวหน้าฝ่ายทะเบียนและบริการการศึกษา',true,'ฝ่ายทะเบียนและบริการการศึกษา'],['ผู้อำนวยการพิจารณา','ผู้อำนวยการสำนักบริหารและพัฒนาวิชาการอนุมัติหรือไม่อนุมัติ',true,'สำนักบริหารและพัฒนาวิชาการ'],['เจ้าหน้าที่บันทึกผล','เจ้าหน้าที่บันทึกผลการเรียน',true,null]],links:[['ดาวน์โหลดคำร้อง มจท. 17','https://edu.mju.ac.th/www/ViewFile.ashx?f=MTYucGRm0','FORM']]},
{code:'GRADE_SU',title:'ลงทะเบียนเพื่อให้ได้ค่าระดับคะแนน S หรือ U',description:'คำร้องขอลงทะเบียนเพื่อให้ได้ค่าระดับคะแนนเป็น S หรือ U มจท. 18',docs:[['สำเนาคำร้องสำหรับอาจารย์ผู้สอน','หลังดำเนินการให้นำสำเนาให้อาจารย์ผู้สอน 1 ฉบับ',true],['สำเนาสำหรับนักศึกษา','นักศึกษาเก็บไว้ 1 ฉบับ',true]],steps:[['กรอกและลงนามคำร้อง','ระบุภาคการศึกษา รายวิชา หน่วยกิต และข้อมูลนักศึกษา',true,null],['อาจารย์ที่ปรึกษาพิจารณา','ขอความเห็นอาจารย์ที่ปรึกษา',true,null],['อาจารย์ผู้สอนพิจารณา','ขอความเห็นอาจารย์ผู้สอน',true,null],['ฝ่ายทะเบียนพิจารณา','ขอความเห็นหัวหน้าฝ่ายทะเบียนและบริการการศึกษา',true,'ฝ่ายทะเบียนและบริการการศึกษา'],['ผู้อำนวยการพิจารณา','ผู้อำนวยการสำนักบริหารและพัฒนาวิชาการอนุมัติหรือไม่อนุมัติ',true,'สำนักบริหารและพัฒนาวิชาการ'],['เจ้าหน้าที่บันทึกผล','เจ้าหน้าที่บันทึกผลการเรียน',true,null]],links:[]},
{code:'EXAM_POSTPONEMENT',title:'ขอเลื่อนสอบและสอบชดใช้',description:'คำร้องขอเลื่อนสอบและสอบชดใช้ ระบุรายวิชา วันเวลาสอบเดิม เหตุผล และวันเวลาที่ขอสอบชดใช้',docs:[['สำเนาสำหรับฝ่ายพัฒนาการศึกษาและหลักสูตร','แบบฟอร์มระบุสำเนาเอกสาร 2 ฉบับ โดยส่งหน่วยงานนี้ 1 ฉบับ',true],['สำเนาสำหรับอาจารย์ประจำรายวิชา','แบบฟอร์มระบุสำเนาเอกสาร 2 ฉบับ โดยส่งอาจารย์ประจำรายวิชา 1 ฉบับ',true]],steps:[['กรอกและลงนามคำร้อง','ระบุรายวิชา วันเวลาสอบเดิม เหตุผล และวันเวลาที่ขอสอบชดใช้',true,null],['อาจารย์ประจำวิชาพิจารณา','ขอความคิดเห็นอาจารย์ประจำวิชา',true,null],['คณบดีพิจารณา','ขอความคิดเห็นคณบดีที่วิชานั้นสังกัด',true,null],['ผู้อำนวยการสำนักพิจารณา','ขอความคิดเห็นผู้อำนวยการสำนักบริหารและพัฒนาวิชาการ',true,'สำนักบริหารและพัฒนาวิชาการ'],['ชำระค่าธรรมเนียม','แบบฟอร์มระบุค่าธรรมเนียม 50 บาท',false,'งานเงินรายได้ กองคลัง']],links:[['ดาวน์โหลดคำร้องขอเลื่อนสอบและสอบชดใช้','https://edu.mju.ac.th/www/ViewFile.ashx?f=MjEucGRm0','FORM']]}
];
const contactDirectory=[
  {
    code:'CS_CURRICULUM_CHAIR',
    personCode:'attawit',
    name:'อ. อรรถวิท ชังคมานนท์',
    position:'ประธานอาจารย์ผู้รับผิดชอบหลักสูตรวิทยาการคอมพิวเตอร์',
    location:'ชั้น 6 อาคาร 60 ปี คณะวิทยาศาสตร์ มหาวิทยาลัยแม่โจ้',
    lastVerifiedAt:verified
  },
  {
    code:'SCIENCE_DEAN',
    name:'รองศาสตราจารย์ ดร.ยุวลี อันพาพรม',
    position:'คณบดีคณะวิทยาศาสตร์',
    location:'งานบริหารและธุรการ ชั้น 1 อาคารจุฬาภรณ์ คณะวิทยาศาสตร์',
    phone:'053-873806, 053-873800-1',
    email:'science@mju.ac.th',
    sourceUrl:'https://www.mju.ac.th/th/Dean.html',
    lastVerifiedAt:verified
  },
  {
    code:'REGISTRATION_HEAD',
    name:'นางสาวสิริประภา วิรัชเจริญพันธ์',
    position:'หัวหน้าฝ่ายทะเบียนและบริการการศึกษา',
    location:'อาคารอำนวย ยศสุข ชั้น 2-3 มหาวิทยาลัยแม่โจ้',
    phone:'053-873458, 053-873459',
    sourceUrl:'https://edu.mju.ac.th/www/Staff.aspx',
    lastVerifiedAt:verified
  },
  {
    code:'ACADEMIC_ADMIN_DIRECTOR',
    name:'ผศ.ดร.ปรีดา ศรีนฤวรรณ',
    position:'รักษาการแทนผู้อำนวยการสำนักบริหารและพัฒนาวิชาการ',
    location:'อาคารอำนวย ยศสุข ชั้น 2-3 มหาวิทยาลัยแม่โจ้',
    phone:'053-873458, 053-873459',
    sourceUrl:'https://edu.mju.ac.th/www/Staff.aspx',
    lastVerifiedAt:verified
  },
  {
    code:'MJU_RECTOR',
    name:'รองศาสตราจารย์ ดร.วีระพล ทองมา',
    position:'อธิการบดีมหาวิทยาลัยแม่โจ้',
    location:'สำนักงานเลขานุการอธิการบดี ชั้น 4 อาคารสำนักงานมหาวิทยาลัย มหาวิทยาลัยแม่โจ้',
    sourceUrl:'https://president.mju.ac.th/wtms_newsDetail.aspx?nID=32783',
    lastVerifiedAt:verified
  }
];

const stepContactsByCode={
  STUDENT_LEAVE_15_DAYS:[
    [],
    [
      {
        label:'นักศึกษา',
        guidance:'นักศึกษาลงชื่อรับรองคำขอด้วยตนเอง'
      }
    ],
    [
      {
        label:'อาจารย์ที่ปรึกษา'
      }
    ],
    [
      {
        label:'อาจารย์ประจำวิชา',
        guidance:'ตรวจสอบรายวิชาและอาจารย์ผู้สอนในระบบ REG',
        actionUrl:'https://reg.mju.ac.th/',
        actionLabel:'ไปที่ระบบ REG'
      }
    ]
  ],

  RESIGNATION:[
    [
      {
        label:'นักศึกษา',
        guidance:'นักศึกษากรอกข้อมูล เหตุผล และลงนามในคำร้อง'
      }
    ],
    [
      {
        label:'อาจารย์ที่ปรึกษา'
      }
    ],
    [
      {
        label:'ประธานอาจารย์ผู้รับผิดชอบหลักสูตรวิทยาการคอมพิวเตอร์',
        contactDirectoryCode:'CS_CURRICULUM_CHAIR',
        guidance:'ติดต่อสาขาวิชาวิทยาการคอมพิวเตอร์ คณะวิทยาศาสตร์'
      }
    ],
    [
      {
        label:'คณบดีคณะวิทยาศาสตร์',
        contactDirectoryCode:'SCIENCE_DEAN',
        guidance:'ติดต่อผ่านงานบริหารและธุรการ คณะวิทยาศาสตร์'
      }
    ],
    [
      {
        label:'ผู้อำนวยการสำนักบริหารและพัฒนาวิชาการ',
        contactDirectoryCode:'ACADEMIC_ADMIN_DIRECTOR'
      }
    ],
    [
      {
        label:'อธิการบดีมหาวิทยาลัยแม่โจ้',
        contactDirectoryCode:'MJU_RECTOR'
      }
    ],
    [
      {
        label:'ฝ่ายทะเบียนเรียนและบริการการศึกษา',
        location:'อาคารอำนวย ยศสุข ชั้น 2–3',
        phone:'053-873459',
        guidance:'ขั้นตอนบันทึกข้อมูลโดยเจ้าหน้าที่ ฝ่ายทะเบียนรับผิดชอบงานลาออก',
        sourceUrl:'https://edu.mju.ac.th/www/Contact.aspx'
      }
    ]
  ],

  TRANSFER_WITHIN_FACULTY:[
    [],
    [
      {
        label:'อาจารย์ที่ปรึกษา'
      },
      {
        label:'ประธานอาจารย์ผู้รับผิดชอบหลักสูตรเดิม',
        guidance:'ติดต่อประธานอาจารย์ผู้รับผิดชอบหลักสูตรของสาขาเดิม'
      }
    ],
    [
      {
        label:'ประธานอาจารย์ผู้รับผิดชอบหลักสูตรใหม่',
        guidance:'ติดต่อประธานอาจารย์ผู้รับผิดชอบหลักสูตรของสาขาใหม่'
      },
      {
        label:'คณบดีคณะวิทยาศาสตร์',
        contactDirectoryCode:'SCIENCE_DEAN',
        guidance:'การโอนย้ายภายในคณะของนักศึกษาวิทยาการคอมพิวเตอร์ ดำเนินการผ่านคณะวิทยาศาสตร์'
      }
    ],
    [
      {
        label:'งานเงินรายได้ กองคลัง',
        location:'ชั้น 1 สำนักงานมหาวิทยาลัย',
        guidance:'ชำระค่าธรรมเนียมตามที่ระบุในแบบคำร้อง มจท.15',
        sourceUrl:'https://edu.mju.ac.th/www/ViewFile.ashx?f=MTQucGRm0'
      }
    ],
    [
      {
        label:'ฝ่ายทะเบียนเรียนและบริการการศึกษา',
        location:'อาคารอำนวย ยศสุข ชั้น 2–3',
        phone:'053-873459',
        guidance:'ฝ่ายทะเบียนรับผิดชอบงานย้ายสาขาวิชา',
        sourceUrl:'https://edu.mju.ac.th/www/Contact.aspx'
      }
    ],
    [
      {
        label:'ฝ่ายทะเบียนเรียนและบริการการศึกษา',
        location:'อาคารอำนวย ยศสุข ชั้น 2–3',
        phone:'053-873459',
        guidance:'เจ้าหน้าที่ดำเนินการตามขั้นตอนหลังรับคำร้อง',
        sourceUrl:'https://edu.mju.ac.th/www/Contact.aspx'
      }
    ]
  ],

  TRANSFER_BETWEEN_FACULTIES:[
    [],
    [
      {
        label:'อาจารย์ที่ปรึกษา'
      },
      {
        label:'ประธานอาจารย์ผู้รับผิดชอบหลักสูตรเดิม',
        guidance:'ติดต่อประธานอาจารย์ผู้รับผิดชอบหลักสูตรเดิม'
      },
      {
        label:'คณบดีคณะเดิม',
        guidance:'ติดต่อคณบดีของคณะเดิม'
      }
    ],
    [
      {
        label:'ประธานอาจารย์ผู้รับผิดชอบหลักสูตรใหม่',
        guidance:'ติดต่อประธานอาจารย์ผู้รับผิดชอบหลักสูตรของสาขาใหม่'
      },
      {
        label:'คณบดีคณะใหม่',
        guidance:'ติดต่อคณบดีของคณะใหม่ตามหลักสูตรที่ขอโอนย้าย'
      }
    ],
    [
      {
        label:'งานเงินรายได้ กองคลัง',
        location:'ชั้น 1 สำนักงานมหาวิทยาลัย',
        guidance:'ชำระค่าธรรมเนียมตามที่ระบุในแบบคำร้อง มจท.16',
        sourceUrl:'https://edu.mju.ac.th/www/ViewFile.ashx?f=MTUucGRm0'
      }
    ],
    [
      {
        label:'ฝ่ายทะเบียนเรียนและบริการการศึกษา',
        location:'อาคารอำนวย ยศสุข ชั้น 2–3',
        phone:'053-873459',
        guidance:'ยื่นคำร้องตามระยะเวลาที่กำหนดในแบบคำร้อง',
        sourceUrl:'https://edu.mju.ac.th/www/Contact.aspx'
      }
    ],
    [
      {
        label:'ฝ่ายทะเบียนเรียนและบริการการศึกษา',
        location:'อาคารอำนวย ยศสุข ชั้น 2–3',
        phone:'053-873459',
        guidance:'เจ้าหน้าที่ดำเนินการตามขั้นตอนหลังรับคำร้อง',
        sourceUrl:'https://edu.mju.ac.th/www/Contact.aspx'
      }
    ]
  ],

  GRADE_V:[
    [],
    [
      {
        label:'อาจารย์ที่ปรึกษา'
      }
    ],
    [
      {
        label:'อาจารย์ผู้สอน',
        guidance:'ตรวจสอบรายวิชาและอาจารย์ผู้สอนในระบบ REG',
        actionUrl:'https://reg.mju.ac.th/',
        actionLabel:'ไปที่ระบบ REG'
      }
    ],
    [
      {
        label:'หัวหน้าฝ่ายทะเบียนและบริการการศึกษา',
        contactDirectoryCode:'REGISTRATION_HEAD'
      }
    ],
    [
      {
        label:'ผู้อำนวยการสำนักบริหารและพัฒนาวิชาการ',
        contactDirectoryCode:'ACADEMIC_ADMIN_DIRECTOR'
      }
    ],
    [
      {
        label:'ฝ่ายทะเบียนเรียนและบริการการศึกษา',
        location:'อาคารอำนวย ยศสุข ชั้น 2–3',
        phone:'053-873459',
        guidance:'เจ้าหน้าที่บันทึกผลหลังคำร้องได้รับการดำเนินการ',
        sourceUrl:'https://edu.mju.ac.th/www/Contact.aspx'
      }
    ]
  ],

  GRADE_SU:[
    [],
    [
      {
        label:'อาจารย์ที่ปรึกษา'
      }
    ],
    [
      {
        label:'อาจารย์ผู้สอน',
        guidance:'ตรวจสอบรายวิชาและอาจารย์ผู้สอนในระบบ REG',
        actionUrl:'https://reg.mju.ac.th/',
        actionLabel:'ไปที่ระบบ REG'
      }
    ],
    [
      {
        label:'หัวหน้าฝ่ายทะเบียนและบริการการศึกษา',
        contactDirectoryCode:'REGISTRATION_HEAD'
      }
    ],
    [
      {
        label:'ผู้อำนวยการสำนักบริหารและพัฒนาวิชาการ',
        contactDirectoryCode:'ACADEMIC_ADMIN_DIRECTOR'
      }
    ],
    [
      {
        label:'ฝ่ายทะเบียนเรียนและบริการการศึกษา',
        location:'อาคารอำนวย ยศสุข ชั้น 2–3',
        phone:'053-873459',
        guidance:'เจ้าหน้าที่บันทึกผลหลังคำร้องได้รับการดำเนินการ',
        sourceUrl:'https://edu.mju.ac.th/www/Contact.aspx'
      }
    ]
  ],

  EXAM_POSTPONEMENT:[
    [],
    [
      {
        label:'อาจารย์ประจำวิชา',
        guidance:'ตรวจสอบรายวิชาและอาจารย์ผู้สอนในระบบ REG',
        actionUrl:'https://reg.mju.ac.th/',
        actionLabel:'ไปที่ระบบ REG'
      }
    ],
    [
      {
        label:'คณบดีคณะที่วิชานั้นสังกัด',
        guidance:'ผู้พิจารณาขึ้นอยู่กับคณะที่รายวิชานั้นสังกัด จึงไม่กำหนดชื่อบุคคลตายตัว'
      }
    ],
    [
      {
        label:'ผู้อำนวยการสำนักบริหารและพัฒนาวิชาการ',
        contactDirectoryCode:'ACADEMIC_ADMIN_DIRECTOR'
      }
    ],
    [
      {
        label:'งานเงินรายได้ กองคลัง',
        guidance:'แบบคำร้องระบุค่าธรรมเนียม 50 บาท',
        sourceUrl:'https://edu.mju.ac.th/www/ViewFile.ashx?f=MjEucGRm0'
      }
    ]
  ]
};

const inputsByCode={
STUDENT_LEAVE_15_DAYS:['วันที่เขียนคำร้อง','เรื่อง','ผู้รับ','ชื่อ-นามสกุล','สาขาวิชาเอก','ชั้นปี','รหัสนักศึกษา','จำนวนวันลา','วันที่เริ่มลาและวันที่สิ้นสุด','เหตุผลการลา','ที่พักระหว่างลา'],
RESIGNATION:['วันที่','ชื่อ-นามสกุล','รหัสนักศึกษา','โทรศัพท์มือถือ','หลักสูตรและภาคการศึกษา','สาขาวิชา','คณะ','เหตุผลขอลาออก'],
TRANSFER_WITHIN_FACULTY:['วันที่','ชื่อ-นามสกุล','รหัสนักศึกษา','เบอร์มือถือ','หลักสูตรและภาค','สาขาวิชาและคณะเดิม','สาขาวิชาและคณะที่ขอโอนย้าย','ภาคการศึกษาและปีการศึกษา','เหตุผลที่ขอโอนย้าย'],
TRANSFER_BETWEEN_FACULTIES:['วันที่','ชื่อ-นามสกุล','รหัสนักศึกษา','เบอร์มือถือ','หลักสูตรและภาค','สาขาวิชาและคณะเดิม','สาขาวิชาและคณะที่ขอโอนย้าย','ภาคการศึกษาและปีการศึกษา','เหตุผลที่ขอโอนย้าย'],
GRADE_V:['วันที่','ภาคการศึกษาและปีการศึกษา','ชื่อ-นามสกุล','รหัสนักศึกษา','เบอร์มือถือ','หลักสูตรและภาค','สาขาวิชา','คณะ','รายวิชา','จำนวนหน่วยกิต'],
GRADE_SU:['วันที่','ภาคการศึกษาและปีการศึกษา','ชื่อ-นามสกุล','รหัสนักศึกษา','เบอร์มือถือ','หลักสูตรและภาค','สาขาวิชา','คณะ','รายวิชา','จำนวนหน่วยกิต'],
EXAM_POSTPONEMENT:['วันที่','ชื่อ-นามสกุล','รหัสนักศึกษา','สาขาวิชา','คณะ','หลักสูตร','รายวิชา','วันและเวลาสอบเดิม','เหตุผล','วันและเวลาที่ขอสอบชดใช้']};
await db.query('BEGIN');
try {
  const contactDirectoryIds=new Map();

  for(const contact of contactDirectory){
    const id=randomUUID();
    const result=await db.query(
      `INSERT INTO contact_directory
        (id,code,person_code,name,position,location,phone,email,source_url,last_verified_at,created_at,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now(),now())
       ON CONFLICT (code) DO UPDATE SET
         person_code=EXCLUDED.person_code,
         name=EXCLUDED.name,
         position=EXCLUDED.position,
         location=EXCLUDED.location,
         phone=EXCLUDED.phone,
         email=EXCLUDED.email,
         source_url=EXCLUDED.source_url,
         last_verified_at=EXCLUDED.last_verified_at,
         updated_at=now()
       RETURNING id`,
      [
        id,
        contact.code,
        contact.personCode??null,
        contact.name??null,
        contact.position,
        contact.location??null,
        contact.phone??null,
        contact.email??null,
        contact.sourceUrl??null,
        contact.lastVerifiedAt??verified
      ]
    );
    contactDirectoryIds.set(contact.code,result.rows[0].id);
  }

  for (const s of services){ const id=randomUUID(); await db.query(`INSERT INTO services (id,code,title,description,is_active,last_verified_at,created_at,updated_at) VALUES ($1,$2,$3,$4,true,$5,now(),now()) ON CONFLICT (code) DO UPDATE SET title=EXCLUDED.title,description=EXCLUDED.description,last_verified_at=EXCLUDED.last_verified_at,updated_at=now() RETURNING id`,[id,s.code,s.title,s.description,verified]).then(async r=>{const sid=r.rows[0].id; await db.query('DELETE FROM service_steps WHERE service_id=$1',[sid]); await db.query('DELETE FROM service_documents WHERE service_id=$1',[sid]); await db.query('DELETE FROM service_links WHERE service_id=$1',[sid]); await db.query('DELETE FROM service_inputs WHERE service_id=$1',[sid]); for(let i=0;i<s.steps.length;i++){
  const [title,description,requiresSignature,location]=s.steps[i];
  const stepId=randomUUID();
  await db.query(
    'INSERT INTO service_steps (id,service_id,step_no,title,description,requires_signature,location) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [stepId,sid,i+1,title,description,requiresSignature,location]
  );

  for(const contact of (stepContactsByCode[s.code]?.[i]??[])){
    await db.query(
      'INSERT INTO service_step_contacts (id,step_id,label,person_name,location,phone,email,guidance,action_url,action_label,source_url,last_verified_at,contact_directory_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',
      [
        randomUUID(),
        stepId,
        contact.label,
        contact.personName??null,
        contact.location??null,
        contact.phone??null,
        contact.email??null,
        contact.guidance??null,
        contact.actionUrl??null,
        contact.actionLabel??null,
        contact.sourceUrl??null,
        contact.lastVerifiedAt??verified,
        contact.contactDirectoryCode
          ? contactDirectoryIds.get(contact.contactDirectoryCode)??null
          : null
      ]
    );
  }
} for(const [name,description,isRequired] of s.docs) await db.query('INSERT INTO service_documents (id,service_id,name,description,is_required) VALUES ($1,$2,$3,$4,$5)',[randomUUID(),sid,name,description,isRequired]); for(const label of (inputsByCode[s.code]??[])) await db.query('INSERT INTO service_inputs (id,service_id,label,is_required) VALUES ($1,$2,$3,true)',[randomUUID(),sid,label]); for(const [title,url,linkType] of s.links) await db.query('INSERT INTO service_links (id,service_id,title,url,link_type) VALUES ($1,$2,$3,$4,$5)',[randomUUID(),sid,title,url,linkType]);}); } await db.query('COMMIT'); console.log(`Seeded ${services.length} verified services`); } catch(e){await db.query('ROLLBACK'); throw e;} finally {await db.end();}
