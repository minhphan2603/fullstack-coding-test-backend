import { Body, Controller, Get, Post } from '@nestjs/common';
import { getRepository } from 'typeorm';
import { IsDateString, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import * as admin from 'firebase-admin';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entity/User';

class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  name: string;

  @IsDateString()
  @ApiProperty()
  dateOfBirth: string;
}

class FirebaseUserDTO {
  @IsString()
  @ApiProperty()
  firebaseId: string;
}

@Controller('user')
export class UserController {
  @Post('sign-up')
  async createUser(@Body() user: CreateUserDto) {
    const existedUser = await getRepository(User).findOne({
      name: user.name,
    });
    if (existedUser) {
      return {
        status: false,
        message: 'User has already existed',
      };
    }
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().createUser({
        email: user.name,
        displayName: user.name,
        emailVerified: false,
      });
    } catch (error) {
      return {
        ...error.errorInfo,
        status: false,
      };
    }
    console.log(firebaseUser);

    const customToken = await admin.auth().createCustomToken(firebaseUser.uid, {
      type: 'user',
    });

    const newUser = new User();
    newUser.name = user.name;
    newUser.dateOfBirth = user.dateOfBirth;
    newUser.firebaseId = firebaseUser.uid;
    newUser.type = 'user';
    const data = getRepository(User).create(newUser);
    getRepository(User).save(data);
    return {
      data: {
        ...data,
        customToken,
      },
      status: true,
    };
  }

  @Post('sign-in')
  async signIn(@Body() user: CreateUserDto) {
    const userData = await getRepository(User).findOne({
      name: user.name,
      dateOfBirth: user.dateOfBirth,
    });

    if (!userData) {
      return {
        status: false,
        message: 'User not found',
      };
    }

    const customToken = await admin
      .auth()
      .createCustomToken(userData.firebaseId, {
        type: userData.type,
      });

    return {
      data: {
        ...userData,
        customToken,
      },
      status: true,
    };
  }

  @Post('sign-in-by-firebase')
  async signInByFirebase(@Body() user: FirebaseUserDTO) {
    const firebaseUser = await admin.auth().getUser(user.firebaseId);

    const userData = await getRepository(User).findOne({
      firebaseId: user.firebaseId,
    });

    if (!userData) {
      const newUser = new User();
      newUser.name = firebaseUser.email;
      newUser.dateOfBirth = '1990-01-01';
      newUser.firebaseId = firebaseUser.uid;
      newUser.type = 'user';
      const data = getRepository(User).create(newUser);
      getRepository(User).save(data);
      return {
        data: {
          ...newUser,
          ...firebaseUser,
        },
        status: true,
      };
    }

    return {
      data: {
        ...userData,
        ...firebaseUser,
      },
      status: true,
    };
  }
}
