import { Entity, Column } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity("categories")
export class Category extends BaseEntity {
  @Column({ type: "varchar", length: 255, unique: true })
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;
}
