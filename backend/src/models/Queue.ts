import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  BelongsToMany,
  DataType
} from "sequelize-typescript";
import User from "./User";
import UserQueue from "./UserQueue";
import Whatsapp from "./Whatsapp";
import WhatsappQueue from "./WhatsappQueue";

@Table
class Queue extends Model<Queue> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Unique
  @Column
  name: string;

  @AllowNull(false)
  @Unique
  @Column
  color: string;

  @Column
  greetingMessage: string;

  @Column
  startWork: string;

  @Column
  endWork: string;

  @Column
  absenceMessage: string;

@Column({
  type: DataType.TEXT,
  get() {
    const rawValue = (this as any).getDataValue('workDays');
    if (!rawValue) return null;
    if (typeof rawValue === 'string') {
      try {
        return JSON.parse(rawValue);
      } catch (e) {
        return null;
      }
    }
    return rawValue;
  },
  set(value: any) {
    if (value && typeof value === 'object') {
      (this as any).setDataValue('workDays', JSON.stringify(value));
    } else {
      (this as any).setDataValue('workDays', value);
    }
  }
})
workDays: object;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsToMany(() => Whatsapp, () => WhatsappQueue)
  whatsapps: Array<Whatsapp & { WhatsappQueue: WhatsappQueue }>;

  @BelongsToMany(() => User, () => UserQueue)
  users: Array<User & { UserQueue: UserQueue }>;
}

export default Queue;