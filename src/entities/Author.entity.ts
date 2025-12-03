import { Entity, Column } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity("authors")
export class Author extends BaseEntity {
  @Column({ type: "varchar", length: 255, unique: true })
  name!: string;

  @Column({ type: "text", nullable: true })
  bio?: string;

  @Column({ type: "date", nullable: true })
  birthDate?: Date;

  @Column({ type: "varchar", length: 100, nullable: true })
  nationality?: string;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;
}
