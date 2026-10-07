import { STUDENTS_DATA } from './mockData';

export interface StudentPrivateDetails {
  studentId: number;
  name: string;
  dateOfBirth: string;
  bloodGroup: string | null;
  mobileNumber: string;
  photoFilename: string;
}

type PrivateFields = Omit<StudentPrivateDetails, 'studentId' | 'name'>;

const PRIVATE_FIELDS_BY_SLUG: Record<string, PrivateFields> = {
  krishnendu: {
    dateOfBirth: '1986-03-15',
    bloodGroup: 'AB+',
    mobileNumber: '9433532325',
    photoFilename: 'krishnendu.jpg'
  },
  'akshay-manohar': {
    dateOfBirth: '1996-11-05',
    bloodGroup: 'B+',
    mobileNumber: '9746671553',
    photoFilename: 'akshay-manohar.jpg'
  },
  amarnath: {
    dateOfBirth: '2005-11-18',
    bloodGroup: 'B+',
    mobileNumber: '7594922877',
    photoFilename: 'amarnath.jpg'
  },
  ajay: {
    dateOfBirth: '1996-11-05',
    bloodGroup: 'B+',
    mobileNumber: '9778464823',
    photoFilename: 'ajay.jpg'
  },
  kajal: {
    dateOfBirth: '2002-10-26',
    bloodGroup: 'A+',
    mobileNumber: '7303164906',
    photoFilename: 'kajal.jpg'
  },
  swechaya: {
    dateOfBirth: '1997-07-21',
    bloodGroup: 'O+',
    mobileNumber: '7753073215',
    photoFilename: 'swechaya.jpg'
  },
  shiva: {
    dateOfBirth: '2008-11-12',
    bloodGroup: 'O+',
    mobileNumber: '8075470620',
    photoFilename: 'shiva.jpg'
  },
  suryanarayan: {
    dateOfBirth: '2001-03-20',
    bloodGroup: 'A+',
    mobileNumber: '8606616281',
    photoFilename: 'suryanarayan.jpg'
  },
  vumi: {
    dateOfBirth: '2007-10-03',
    bloodGroup: 'O+',
    mobileNumber: '7827072971',
    photoFilename: 'vumi.jpg'
  },
  sanju: {
    dateOfBirth: '2007-07-05',
    bloodGroup: 'B+',
    mobileNumber: '8002783093',
    photoFilename: 'sanju.jpg'
  },
  shshni: {
    dateOfBirth: '2008-01-01',
    bloodGroup: null,
    mobileNumber: '7070080689',
    photoFilename: 'shshni.jpg'
  },
  tony: {
    dateOfBirth: '2006-01-01',
    bloodGroup: 'O+',
    mobileNumber: '7766069829',
    photoFilename: 'tony.jpg'
  },
  'abijay-biju-s-b': {
    dateOfBirth: '2003-04-08',
    bloodGroup: 'B+',
    mobileNumber: '9061496458',
    photoFilename: 'abijay-biju-s-b.jpg'
  },
  'vatan-mishra': {
    dateOfBirth: '2004-07-13',
    bloodGroup: 'B+',
    mobileNumber: '8851118715',
    photoFilename: 'vatan-mishra.jpg'
  },
  'amal-velayudhan-t-v': {
    dateOfBirth: '1997-06-26',
    bloodGroup: 'O+',
    mobileNumber: '8281011533',
    photoFilename: 'amal-velayudhan-t-v.jpg'
  }
};

export const STUDENTS_PRIVATE: StudentPrivateDetails[] = STUDENTS_DATA.map((student) => {
  const details = student.slug ? PRIVATE_FIELDS_BY_SLUG[student.slug] : undefined;

  if (!details) {
    throw new Error(`Missing private student details for student #${student.id}`);
  }

  return {
    studentId: student.id,
    name: student.name,
    ...details
  };
});
