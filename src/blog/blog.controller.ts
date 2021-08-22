import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { getRepository } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import * as admin from 'firebase-admin';
import { Blog } from '../entity/Blog';

class CreateBlogDto {
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  imgSrc: string;
  @IsNotEmpty()
  content: string;
}

@Controller('blog')
export class BlogController {
  @Get()
  async getBlogs() {
    return getRepository(Blog).findAndCount();
  }

  @Post()
  async createBlog(@Body() blogData: CreateBlogDto) {
    const docRef = await admin.firestore().collection('blogs').add(blogData);
    console.log(docRef);

    const newBlog = getRepository(Blog).create({
      ...blogData,
      firebaseId: docRef.id,
    });

    getRepository(Blog).save(newBlog);

    return newBlog;
  }

  @Put(':id')
  async updateBlog(@Param() param, @Body() blogData: CreateBlogDto) {
    try {
      console.log(param);
      const blog = await getRepository(Blog).findOne(param.id);
      if (!blog) {
        return {
          status: false,
          message: 'Blog not found!',
        };
      }
      blog.title = blogData.title;
      blog.content = blogData.content;
      blog.imgSrc = blogData.imgSrc;
      await Promise.all([
        getRepository(Blog).save(blog),
        admin
          .firestore()
          .collection('blogs')
          .doc(blog.firebaseId)
          .set(blogData),
      ]);
      return {
        status: true,
      };
    } catch (error) {
      console.log('asdfasdfasdfasdfasdfa sasdfasdfasdf12312312 ', error);
      return {
        status: false,
      };
    }
  }

  @Delete(':id')
  async deleteBlog(@Param() param) {
    console.log(param);
    const blog = await getRepository(Blog).findOne(param.id);
    if (!blog) {
      return {
        status: false,
        message: 'Blog not found!',
      };
    }

    try {
      await Promise.all([
        getRepository(Blog).delete(blog),
        admin.firestore().collection('blogs').doc(blog.firebaseId).delete(),
      ]);
    } catch (error) {
      console.log('deleteBlog', error);
      return {
        status: false,
      };
    }

    return {
      status: true,
    };
  }
}
