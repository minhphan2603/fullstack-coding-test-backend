import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  title: string;

  @Column('text')
  content: string;

  @Column('text')
  imgSrc: string;

  @Column('text')
  firebaseId: string;
}
