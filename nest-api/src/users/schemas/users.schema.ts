import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string; // será criptografada

  @Prop({ default: 'user' })
  role!: string; // ex: admin, user
}

export const UserSchema = SchemaFactory.createForClass(User);
