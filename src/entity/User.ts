import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity()
@Unique('UQ_USER', ['id', 'name', 'dateOfBirth'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column('date')
  dateOfBirth: string;

  @Column('text')
  firebaseId: string;

  @Column({ enum: ['admin', 'user'] })
  type: string;
}
