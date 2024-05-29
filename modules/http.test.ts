import axios from "axios";
import { Oauth1Helper } from "./oauth";
import { HTTP } from "./http";
import { loggerService } from "./log";

jest.mock("axios");
jest.mock('./oauth');
jest.mock('./log');